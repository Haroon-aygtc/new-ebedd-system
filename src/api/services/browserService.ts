/**
 * Browser Service
 * Manages headless browser instances for JavaScript rendering and advanced scraping
 */

import puppeteer from "puppeteer";
import type { Browser, Page, CookieParam, HTTPRequest } from "puppeteer";
import { getRandomUserAgent } from "./userAgentService";

// Types
export interface BrowserOptions {
  headless?: boolean;
  userAgent?: string;
  proxy?: string;
  cookies?: Record<string, string>;
  viewport?: { width: number; height: number };
  timeout?: number;
  blockImages?: boolean;
  blockCss?: boolean;
  blockFonts?: boolean;
  extraHeaders?: Record<string, string>;
  executablePath?: string;
}

// Default options
const defaultOptions: BrowserOptions = {
  headless: true,
  viewport: { width: 1920, height: 1080 },
  timeout: 30000,
  blockImages: true,
  blockCss: false,
  blockFonts: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
};

// Browser pool
let browserInstances: Browser[] = [];
const MAX_BROWSER_INSTANCES = 3;

/**
 * Initialize a new browser instance
 */
export const initBrowser = async (
  options: BrowserOptions = {},
): Promise<Browser> => {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: mergedOptions.headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
        mergedOptions.proxy ? `--proxy-server=${mergedOptions.proxy}` : "",
      ].filter(Boolean),
      executablePath: mergedOptions.executablePath,
    });

    // Add to pool
    browserInstances.push(browser);

    // Manage pool size
    if (browserInstances.length > MAX_BROWSER_INSTANCES) {
      const oldestBrowser = browserInstances.shift();
      if (oldestBrowser) {
        await oldestBrowser
          .close()
          .catch((err: Error) => console.error("Error closing browser:", err));
      }
    }

    return browser;
  } catch (error) {
    console.error("Error initializing browser:", error);
    throw error;
  }
};

/**
 * Get a page with configured options
 */
export const getConfiguredPage = async (
  browser: Browser,
  options: BrowserOptions = {},
): Promise<Page> => {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    // Create new page
    const page = await browser.newPage();

    // Set user agent
    if (mergedOptions.userAgent) {
      await page.setUserAgent(mergedOptions.userAgent);
    } else {
      await page.setUserAgent(getRandomUserAgent().value);
    }

    // Set viewport
    if (mergedOptions.viewport) {
      await page.setViewport(mergedOptions.viewport);
    }

    // Set extra headers
    if (mergedOptions.extraHeaders) {
      await page.setExtraHTTPHeaders(mergedOptions.extraHeaders);
    }

    // Set cookies
    if (mergedOptions.cookies) {
      const cookies: CookieParam[] = Object.entries(mergedOptions.cookies).map(
        ([name, value]) => ({
          name,
          value,
          domain: ".",
          path: "/",
        }),
      );
      // Use setCookie with the cookies array
      // @ts-ignore - The type definition is incorrect, setCookie accepts an array
      await page.setCookie(...cookies);
    }

    // Set request interception
    await page.setRequestInterception(true);
    page.on("request", (request: HTTPRequest) => {
      const resourceType = request.resourceType();

      if (
        (mergedOptions.blockImages && resourceType === "image") ||
        (mergedOptions.blockCss && resourceType === "stylesheet") ||
        (mergedOptions.blockFonts && resourceType === "font") ||
        ["media", "websocket"].includes(resourceType)
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Set default timeout
    page.setDefaultTimeout(mergedOptions.timeout || 30000);

    return page;
  } catch (error) {
    console.error("Error configuring page:", error);
    throw error;
  }
};

/**
 * Scrape a URL using Puppeteer
 */
export const scrapeWithBrowser = async (
  url: string,
  options: BrowserOptions = {},
  evaluateFunction?: (page: Page) => Promise<any>,
): Promise<{ html: string; screenshot?: Buffer; result?: any }> => {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await initBrowser(options);
    page = await getConfiguredPage(browser, options);

    // Navigate to URL
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: options.timeout || 30000,
    });

    // Wait a bit for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get page content
    const html = await page.content();

    // Take screenshot if needed
    const screenshotBuffer = await page.screenshot({ type: "png", fullPage: true });
    const screenshot = Buffer.from(screenshotBuffer);

    // Evaluate custom function if provided
    let result: any = undefined;
    if (evaluateFunction) {
      result = await evaluateFunction(page);
    }

    return { html, screenshot, result };
  } catch (error) {
    console.error("Error scraping with browser:", error);
    throw error;
  } finally {
    // Clean up
    if (page) {
      await page
        .close()
        .catch((err: Error) => console.error("Error closing page:", err));
    }
  }
};

/**
 * Close all browser instances
 */
export const closeAllBrowsers = async (): Promise<void> => {
  for (const browser of browserInstances) {
    await browser
      .close()
      .catch((err: Error) => console.error("Error closing browser:", err));
  }
  browserInstances = [];
};

/**
 * Extract data from a page using selectors
 */
export const extractDataWithSelectors = async (
  page: Page,
  selectors: Array<{ selector: string; type: string; name?: string }>,
): Promise<Record<string, any>> => {
  return page.evaluate((selectorsArray: Array<{ selector: string; type: string; name?: string }>) => {
    const result: Record<string, any> = {};

    for (const { selector, type, name } of selectorsArray) {
      const elements = document.querySelectorAll(selector);
      const key = name || selector;

      if (elements.length > 0) {
        if (type === "text") {
          result[key] = elements[0].textContent?.trim() || "";
        } else if (type === "html") {
          result[key] = elements[0].innerHTML?.trim() || "";
        } else if (type === "attribute" && name) {
          result[key] = elements[0].getAttribute(name) || "";
        } else if (type === "image") {
          result[key] = (elements[0] as HTMLImageElement).src || "";
        } else if (type === "link") {
          result[key] = (elements[0] as HTMLAnchorElement).href || "";
        } else if (type === "list") {
          result[key] = Array.from(elements).map(
            (el) => el.textContent?.trim() || "",
          );
        }
      }
    }

    return result;
  }, selectors);
};
