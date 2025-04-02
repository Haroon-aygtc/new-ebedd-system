import axios from "axios";
import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import {
  getNextProxy,
  formatProxyForAxios,
  markProxySuccess,
  markProxyFailure,
} from "./proxyService";
import { getRandomUserAgent, UserAgent } from "./userAgentService";
import { scrapeWithBrowser, extractDataWithSelectors } from "./browserService";

interface ScrapeJob {
  id: string;
  url: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  selectors: any[];
  options: ScrapeOptions;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  priority: number;
  retryCount: number;
}

interface ScrapeOptions {
  waitForSelector?: string;
  timeout?: number;
  proxy?: string | "auto" | "none";
  userAgent?: string | UserAgent;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  followRedirects?: boolean;
  maxDepth?: number;
  delay?: number;
  javascript?: boolean;
  pagination?: boolean;
  paginationSelector?: string;
  maxPages?: number;
  extractionMode?: "raw" | "cleaned" | "semantic" | "vectorized";
  formatOptions?: {
    skipHeaders?: boolean;
    skipFooters?: boolean;
    excludeAds?: boolean;
    excludeMedia?: boolean;
    summarize?: boolean;
  };
}

// Queue for managing scrape jobs
let scrapeQueue: ScrapeJob[] = [];
let isProcessing = false;

/**
 * Add a job to the scrape queue
 */
export const addToScrapeQueue = (
  url: string,
  selectors: any[],
  options: ScrapeOptions,
  priority = 1,
): string => {
  const jobId = uuidv4();

  const job: ScrapeJob = {
    id: jobId,
    url,
    status: "pending",
    selectors,
    options,
    priority,
    retryCount: 0,
  };

  scrapeQueue.push(job);

  // Sort queue by priority (higher numbers = higher priority)
  scrapeQueue.sort((a, b) => b.priority - a.priority);

  // Start processing if not already running
  if (!isProcessing) {
    processQueue();
  }

  return jobId;
};

/**
 * Add multiple URLs to the scrape queue
 */
export const addBatchToScrapeQueue = (
  urls: string[],
  selectors: any[],
  options: ScrapeOptions,
  priority = 1,
): string[] => {
  return urls.map((url) => addToScrapeQueue(url, selectors, options, priority));
};

/**
 * Process the scrape queue
 */
const processQueue = async () => {
  if (scrapeQueue.length === 0 || isProcessing) {
    return;
  }

  isProcessing = true;

  // Get the next job from the queue
  const job = scrapeQueue.shift();
  if (!job) {
    isProcessing = false;
    return;
  }

  try {
    job.status = "in-progress";
    job.startTime = new Date();

    // Execute the scrape
    const result = await scrapeUrl(job.url, job.selectors, job.options);

    // Update job status
    job.status = "completed";
    job.endTime = new Date();

    // Save the result
    await saveScrapedData(job.url, result, job.selectors);

    // Continue processing the queue
    isProcessing = false;
    processQueue();

    return result;
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);

    // Handle retry logic
    if (job.retryCount < 3) {
      job.retryCount++;
      job.priority--; // Lower priority for retries
      job.status = "pending";
      scrapeQueue.push(job);
    } else {
      job.status = "failed";
      job.error = error.message;
      job.endTime = new Date();
      // Save failed job for reporting
      saveScrapeJob(job);
    }

    // Continue processing the queue
    isProcessing = false;
    processQueue();

    throw error;
  }
};

/**
 * Save a scrape job to the database
 */
const saveScrapeJob = async (job: ScrapeJob) => {
  // In a real implementation, this would save to a database
  console.log("Saving scrape job:", job);
};

/**
 * Scrape a URL with the given selectors and options
 */
export const scrapeUrl = async (
  url: string,
  selectors: any[],
  options: ScrapeOptions = {},
) => {
  try {
    // Apply default options
    const defaultOptions: ScrapeOptions = {
      timeout: 30000,
      proxy: "none",
      followRedirects: true,
      javascript: false,
      pagination: false,
      maxPages: 1,
      extractionMode: "cleaned",
      formatOptions: {
        skipHeaders: false,
        skipFooters: false,
        excludeAds: true,
        excludeMedia: false,
        summarize: false,
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // If JavaScript is required, use browser automation
    if (mergedOptions.javascript) {
      return await scrapeWithJavaScript(url, selectors, mergedOptions);
    } else {
      return await scrapeWithCheerio(url, selectors, mergedOptions);
    }
  } catch (error) {
    console.error("Error scraping URL:", error);
    throw error;
  }
};

/**
 * Scrape with Cheerio (no JavaScript support)
 */
const scrapeWithCheerio = async (
  url: string,
  selectors: any[],
  options: ScrapeOptions,
) => {
  try {
    // Configure request options
    const requestOptions: any = {
      timeout: options.timeout,
      headers: {
        "User-Agent": (typeof options.userAgent === "string" ? options.userAgent : options.userAgent?.toString() || getRandomUserAgent().toString()) as string,
        ...options.headers,
      },
      maxRedirects: options.followRedirects ? 5 : 0,
    };

    // Apply proxy if needed
    let proxyUrl = "";
    if (options.proxy === "auto") {
      const proxy = getNextProxy();
      proxyUrl = proxy.url;
      requestOptions.proxy = formatProxyForAxios(proxy);
    } else if (options.proxy && options.proxy !== "none") {
      proxyUrl = options.proxy;
      requestOptions.proxy = options.proxy;
    }

    // Apply random delay if specified
    if (options.delay) {
      const randomDelay = options.delay * (0.5 + Math.random());
      await new Promise((resolve) => setTimeout(resolve, randomDelay * 1000));
    }

    // Fetch the page
    const startTime = Date.now();
    const response = await axios.get(url, requestOptions);
    const responseTime = Date.now() - startTime;

    // Report proxy success if used
    if (proxyUrl) {
      markProxySuccess(proxyUrl, responseTime);
    }

    const html = response.data;

    // Parse with cheerio
    const $ = cheerio.load(html);

    // Extract data based on selectors
    const extractedData: any = {};

    // For semantic extraction, we'll try to auto-detect content types
    if (options.extractionMode === "semantic") {
      // Auto-detect tables
      const tables: any[] = [];
      $("table").each((_, table) => {
        const tableData: any[] = [];
        $(table)
          .find("tr")
          .each((_, row) => {
            const rowData: string[] = [];
            $(row)
              .find("td, th")
              .each((_, cell) => {
                rowData.push($(cell).text().trim());
              });
            if (rowData.length > 0) {
              tableData.push(rowData);
            }
          });
        if (tableData.length > 0) {
          tables.push(tableData);
        }
      });
      if (tables.length > 0) {
        extractedData.tables = tables;
      }

      // Auto-detect lists
      const lists: any[] = [];
      $("ul, ol").each((_, list) => {
        const listItems: string[] = [];
        $(list)
          .find("li")
          .each((_, item) => {
            listItems.push($(item).text().trim());
          });
        if (listItems.length > 0) {
          lists.push(listItems);
        }
      });
      if (lists.length > 0) {
        extractedData.lists = lists;
      }

      // Auto-detect articles/content
      const articles: any[] = [];
      $("article, .article, .content, .post").each((_, article) => {
        const title = $(article).find("h1, h2, .title").first().text().trim();
        const content = $(article).text().trim();
        articles.push({ title, content });
      });
      if (articles.length > 0) {
        extractedData.articles = articles;
      }
    }

    // Process user-defined selectors
    for (const selector of selectors) {
      try {
        const elements = $(selector.selector);
        if (elements.length > 0) {
          if (selector.type === "text") {
            extractedData[selector.name || selector.selector] = elements
              .first()
              .text()
              .trim();
          } else if (selector.type === "image") {
            extractedData[selector.name || selector.selector] = elements
              .first()
              .attr("src");
          } else if (selector.type === "link") {
            extractedData[selector.name || selector.selector] = elements
              .first()
              .attr("href");
          } else if (selector.type === "html") {
            extractedData[selector.name || selector.selector] = elements
              .first()
              .html();
          } else if (selector.type === "attribute") {
            extractedData[selector.name || selector.selector] = elements
              .first()
              .attr(selector.attribute);
          } else if (selector.type === "list") {
            const items: string[] = [];
            elements.each((_, el) => {
              items.push($(el).text().trim());
            });
            extractedData[selector.name || selector.selector] = items;
          }
        }
      } catch (error) {
        console.error(`Error extracting selector ${selector.selector}:`, error);
      }
    }

    // Handle pagination if enabled
    if (
      options.pagination &&
      options.maxPages > 1 &&
      options.paginationSelector
    ) {
      const nextPageUrl = $(options.paginationSelector).attr("href");
      if (nextPageUrl) {
        // Resolve relative URLs
        const absoluteNextUrl = new URL(nextPageUrl, url).href;

        // Check if we've already processed this URL to avoid loops
        if (absoluteNextUrl !== url) {
          // Recursively scrape the next page with reduced maxPages
          const nextPageOptions = {
            ...options,
            maxPages: options.maxPages - 1,
          };

          const nextPageData = await scrapeUrl(
            absoluteNextUrl,
            selectors,
            nextPageOptions,
          );

          // Merge data from next page
          for (const key in nextPageData) {
            if (
              Array.isArray(extractedData[key]) &&
              Array.isArray(nextPageData[key])
            ) {
              extractedData[key] = [
                ...extractedData[key],
                ...nextPageData[key],
              ];
            } else if (!extractedData[key]) {
              extractedData[key] = nextPageData[key];
            }
          }
        }
      }
    }

    return extractedData;
  } catch (error) {
    console.error("Error scraping with Cheerio:", error);

    // Mark proxy as failed if used
    if (options.proxy && options.proxy !== "none" && options.proxy !== "auto") {
      markProxyFailure(options.proxy);
    }

    throw error;
  }
};

/**
 * Scrape with browser automation (with JavaScript support)
 */
const scrapeWithJavaScript = async (
  url: string,
  selectors: any[],
  options: ScrapeOptions,
) => {
  try {
    // Apply random delay if specified
    if (options.delay) {
      const randomDelay = options.delay * (0.5 + Math.random());
      await new Promise((resolve) => setTimeout(resolve, randomDelay * 1000));
    }

    // Configure browser options
    const browserOptions = {
      headless: true,
      userAgent: typeof options.userAgent === "string" ? options.userAgent : getRandomUserAgent().toString(),
      timeout: options.timeout,
      blockImages: options.formatOptions?.excludeMedia,
      cookies: options.cookies,
      proxy: undefined as string | undefined, // Add proxy property
    };

    // Apply proxy if needed
    if (options.proxy === "auto") {
      const proxy = getNextProxy();
      browserOptions.proxy = formatProxyForAxios(proxy);
    } else if (options.proxy && options.proxy !== "none") {
      browserOptions.proxy = options.proxy;
    }

    // Scrape with browser
    const { html, result } = await scrapeWithBrowser(
      url,
      {
        ...browserOptions,
        userAgent: browserOptions.userAgent.toString(),
      },
      async (page) => {
        // Wait for specific selector if provided
        if (options.waitForSelector) {
          await page
            .waitForSelector(options.waitForSelector, {
              timeout: options.timeout || 30000,
            })
            .catch(() => { });
        }

        // Extract data using selectors
        return extractDataWithSelectors(page, selectors);
      },
    );

    // Handle pagination if enabled
    if (
      options.pagination &&
      options.maxPages > 1 &&
      options.paginationSelector &&
      result
    ) {
      try {
        // Parse the HTML to find the next page URL
        const $ = cheerio.load(html);
        const nextPageUrl = $(options.paginationSelector).attr("href");

        if (nextPageUrl) {
          // Resolve relative URLs
          const absoluteNextUrl = new URL(nextPageUrl, url).href;

          // Check if we've already processed this URL to avoid loops
          if (absoluteNextUrl !== url) {
            // Recursively scrape the next page with reduced maxPages
            const nextPageOptions = {
              ...options,
              maxPages: options.maxPages - 1,
            };

            const nextPageData = await scrapeUrl(
              absoluteNextUrl,
              selectors,
              nextPageOptions,
            );

            // Merge data from next page
            for (const key in nextPageData) {
              if (
                Array.isArray(result[key]) &&
                Array.isArray(nextPageData[key])
              ) {
                result[key] = [...result[key], ...nextPageData[key]];
              } else if (!result[key]) {
                result[key] = nextPageData[key];
              }
            }
          }
        }
      } catch (error) {
        console.error("Error handling pagination:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error scraping with browser:", error);
    throw error;
  }
};

/**
 * Save scraped data to the database
 */
export const saveScrapedData = async (
  url: string,
  data: any,
  selectors: any[],
) => {
  try {
    const scrapedData = {
      id: uuidv4(),
      url,
      timestamp: new Date().toISOString(),
      data,
      selectors,
    };

    // In a real implementation, this would save to a database
    console.log("Saving scraped data:", scrapedData);

    return scrapedData;
  } catch (error) {
    console.error("Error saving scraped data:", error);
    throw error;
  }
};

/**
 * Export scraped data to a file
 */
export const exportScrapedData = async (
  data: any,
  format: "json" | "csv" | "sql" | "vector" = "json",
  options: any = {},
) => {
  try {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);

      case "csv":
        // Simple CSV conversion
        if (!Array.isArray(data)) {
          data = [data];
        }

        // Get all unique keys
        const keys = new Set<string>();
        data.forEach((item: any) => {
          Object.keys(item).forEach((key) => keys.add(key));
        });

        // Create CSV header
        let csv = Array.from(keys).join(",") + "\n";

        // Add data rows
        data.forEach((item: any) => {
          const row = Array.from(keys)
            .map((key) => {
              const value = item[key];
              if (value === undefined || value === null) return "";
              if (typeof value === "string")
                return `"${value.replace(/"/g, '""')}"`;
              if (Array.isArray(value))
                return `"${value.join(", ").replace(/"/g, '""')}"`;
              return value;
            })
            .join(",");
          csv += row + "\n";
        });

        return csv;

      case "sql":
        // Simple SQL insert statements
        if (!Array.isArray(data)) {
          data = [data];
        }

        const tableName = options.tableName || "scraped_data";
        let sql = "";

        // Create table statement
        const allKeys = new Set<string>();
        data.forEach((item: any) => {
          Object.keys(item).forEach((key) => allKeys.add(key));
        });

        sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
        sql += `  id INT AUTO_INCREMENT PRIMARY KEY,\n`;
        Array.from(allKeys).forEach((key) => {
          sql += `  \`${key}\` TEXT,\n`;
        });
        sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
        sql += `);\n\n`;

        // Insert statements
        data.forEach((item: any) => {
          const columns = Object.keys(item)
            .map((k) => `\`${k}\``)
            .join(", ");
          const values = Object.values(item)
            .map((value) => {
              if (value === undefined || value === null) return "NULL";
              if (typeof value === "string")
                return `'${value.replace(/'/g, "''")}'`;
              if (Array.isArray(value))
                return `'${value.join(", ").replace(/'/g, "''")}'`;
              return value;
            })
            .join(", ");

          sql += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
        });

        return sql;

      case "vector":
        // In a real implementation, this would convert data to vector embeddings
        return JSON.stringify(
          {
            vectors: data.map((item: any) => ({
              id: uuidv4(),
              content: typeof item === "string" ? item : JSON.stringify(item),
              embedding: Array(128)
                .fill(0)
                .map(() => Math.random() - 0.5), // Mock embedding vector
              metadata: { source: "scraper" },
            })),
            data,
          },
          null,
          2,
        );

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    throw error;
  }
};

/**
 * Discover URLs from a starting point
 */
export const discoverUrls = async (startUrl: string, options: any = {}) => {
  try {
    const {
      maxDepth = 1,
      urlPattern,
      maxUrls = 100,
      sameDomain = true,
      javascript = false,
    } = options;

    const discovered = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = [
      { url: startUrl, depth: 0 },
    ];
    const startUrlDomain = new URL(startUrl).hostname;

    while (queue.length > 0 && discovered.size < maxUrls) {
      const { url, depth } = queue.shift()!;

      if (discovered.has(url)) continue;
      discovered.add(url);

      if (depth >= maxDepth) continue;

      try {
        // Use browser for JavaScript-heavy sites
        if (javascript) {
          const { html } = await scrapeWithBrowser(url, {}, async (page) => {
            // Extract all links
            return page.evaluate(() => {
              return Array.from(document.querySelectorAll("a[href]")).map((a) =>
                a.getAttribute("href"),
              );
            });
          });

          // Parse HTML with cheerio to extract links
          const $ = cheerio.load(html);
          $("a[href]").each((_, link) => {
            try {
              const href = $(link).attr("href");
              if (!href) return;

              // Resolve relative URLs
              const absoluteUrl = new URL(href, url).href;

              // Check if URL matches pattern
              if (urlPattern && !absoluteUrl.match(urlPattern)) return;

              // Check if URL is from the same domain
              if (
                sameDomain &&
                new URL(absoluteUrl).hostname !== startUrlDomain
              )
                return;

              // Add to queue
              if (!discovered.has(absoluteUrl)) {
                queue.push({ url: absoluteUrl, depth: depth + 1 });
              }
            } catch (error) {
              // Skip invalid URLs
            }
          });
        } else {
          // Use Axios for static sites
          const response = await axios.get(url, {
            timeout: 10000,
            headers: {
              "User-Agent": typeof options.userAgent === "string" ? options.userAgent : getRandomUserAgent(),
              ...options.headers,
            },
            maxRedirects: options.followRedirects ? 5 : 0,
          });

          const html = response.data;
          const $ = cheerio.load(html);

          $("a[href]").each((_, link) => {
            try {
              const href = $(link).attr("href");
              if (!href) return;

              // Resolve relative URLs
              const absoluteUrl = new URL(href, url).href;

              // Check if URL matches pattern
              if (urlPattern && !absoluteUrl.match(urlPattern)) return;

              // Check if URL is from the same domain
              if (
                sameDomain &&
                new URL(absoluteUrl).hostname !== startUrlDomain
              )
                return;

              // Add to queue
              if (!discovered.has(absoluteUrl)) {
                queue.push({ url: absoluteUrl, depth: depth + 1 });
              }
            } catch (error) {
              // Skip invalid URLs
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    }

    return Array.from(discovered);
  } catch (error) {
    console.error("Error discovering URLs:", error);
    throw error;
  }
};

/**
 * Get the HTML content of a page
 * @param url The URL to fetch
 * @param options Optional configuration
 */
export const getPageContent = async (url: string, options: any = {}) => {
  try {
    // Determine if we should use browser automation
    const useJavaScript = options.javascript === true;

    if (useJavaScript) {
      // Use browser automation for JavaScript-heavy sites
      const browserOptions = {
        headless: true,
        userAgent: getRandomUserAgent(),
        timeout: options.timeout || 30000,
        proxy: options.proxy || 'none',
      };

      const { html } = await scrapeWithBrowser(url, {
        ...browserOptions,
        userAgent: browserOptions.userAgent.toString(),
      });
      return html;
    } else {
      // Use axios for static sites
      const response = await axios.get(url, {
        headers: {
          'User-Agent': getRandomUserAgent().toString(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        } as any,
        timeout: options.timeout || 30000,
        maxRedirects: 5
      });

      return response.data;
    }
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
};

/**
 * Get pre-built templates for popular sites
 */
export const getScrapingTemplates = () => {
  return [
    {
      name: "E-commerce Product",
      selectors: [
        {
          selector: 'h1, .product-title, [itemprop="name"]',
          type: "text",
          name: "title",
        },
        { selector: '.price, [itemprop="price"]', type: "text", name: "price" },
        {
          selector: '.description, [itemprop="description"]',
          type: "text",
          name: "description",
        },
        {
          selector: '.product-image, [itemprop="image"]',
          type: "image",
          name: "image",
        },
        {
          selector: '.rating, [itemprop="ratingValue"]',
          type: "text",
          name: "rating",
        },
        {
          selector: '.reviews, [itemprop="reviewCount"]',
          type: "text",
          name: "reviewCount",
        },
      ],
      options: {
        waitForSelector: ".product-container",
        javascript: true,
        extractionMode: "cleaned",
      },
    },
    {
      name: "News Article",
      selectors: [
        {
          selector: 'h1, .article-title, [itemprop="headline"]',
          type: "text",
          name: "title",
        },
        {
          selector: '.article-content, [itemprop="articleBody"]',
          type: "text",
          name: "content",
        },
        {
          selector: '.author, [itemprop="author"]',
          type: "text",
          name: "author",
        },
        {
          selector: '.published-date, [itemprop="datePublished"]',
          type: "text",
          name: "date",
        },
        {
          selector: '.featured-image, [itemprop="image"]',
          type: "image",
          name: "image",
        },
      ],
      options: {
        waitForSelector: "article",
        javascript: true,
        extractionMode: "cleaned",
        formatOptions: {
          skipHeaders: true,
          skipFooters: true,
          excludeAds: true,
        },
      },
    },
    {
      name: "Search Results",
      selectors: [
        { selector: ".result, .search-result", type: "list", name: "results" },
        {
          selector: ".result-title, .search-result-title",
          type: "list",
          name: "titles",
        },
        {
          selector: ".result-link, .search-result-link",
          type: "link",
          name: "links",
        },
        {
          selector: ".result-description, .search-result-description",
          type: "list",
          name: "descriptions",
        },
      ],
      options: {
        pagination: true,
        paginationSelector: '.next-page, .pagination a[rel="next"]',
        maxPages: 5,
        javascript: true,
      },
    },
  ];
};

/**
 * Analyze HTML content and suggest selectors
 */
export const analyzeHtmlForSelectors = (html: string) => {
  const $ = cheerio.load(html);
  const suggestions = [];

  // Check for product elements
  if ($('.product, [itemtype*="Product"], .item').length > 0) {
    suggestions.push({
      selector: '.product, [itemtype*="Product"], .item',
      type: "container",
      name: "product",
    });
  }

  // Check for titles
  if ($('h1, .title, .product-title, [itemprop="name"]').length > 0) {
    suggestions.push({
      selector: 'h1, .title, .product-title, [itemprop="name"]',
      type: "text",
      name: "title",
    });
  }

  // Check for prices
  if ($('.price, [itemprop="price"], .product-price').length > 0) {
    suggestions.push({
      selector: '.price, [itemprop="price"], .product-price',
      type: "text",
      name: "price",
    });
  }

  // Check for images
  if ($('img.product-image, [itemprop="image"], .main-image').length > 0) {
    suggestions.push({
      selector: 'img.product-image, [itemprop="image"], .main-image',
      type: "image",
      name: "image",
    });
  }

  // Check for descriptions
  if (
    $('.description, [itemprop="description"], .product-description').length > 0
  ) {
    suggestions.push({
      selector: '.description, [itemprop="description"], .product-description',
      type: "text",
      name: "description",
    });
  }

  // Check for links
  if ($('a.product-link, [itemprop="url"]').length > 0) {
    suggestions.push({
      selector: 'a.product-link, [itemprop="url"]',
      type: "link",
      name: "productUrl",
    });
  }

  return suggestions;
};
