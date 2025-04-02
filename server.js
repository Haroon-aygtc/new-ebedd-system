import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Random user agents to avoid detection
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
];

// Get a random user agent
const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Proxy a URL and return the HTML content
app.post('/api/proxy/url', async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    console.log(`Proxying URL: ${url}`);

    // Fetch the URL content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': options.userAgent || getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': new URL(url).origin,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: options.timeout || 30000,
      maxRedirects: 5,
      responseType: 'text'
    });

    console.log(`Received response from ${url} with status ${response.status}`);

    // Process the HTML content
    if (response.headers['content-type']?.includes('text/html')) {
      const processedHtml = processHtml(response.data, url);

      return res.status(200).json({
        success: true,
        data: {
          content: processedHtml,
          contentType: 'text/html',
          baseUrl: url,
          title: getTitle(response.data)
        }
      });
    }

    // Return raw content for non-HTML responses
    return res.status(200).json({
      success: true,
      data: {
        content: response.data,
        contentType: response.headers['content-type'],
        baseUrl: url
      }
    });
  } catch (error) {
    console.error('Error proxying URL:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unknown error',
      error: error.message || 'Unknown error'
    });
  }
});

// Proxy a resource (image, CSS, JS, etc.)
app.get('/api/proxy/resource', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    // Fetch the resource
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Referer': new URL(url).origin
      }
    });

    // Set appropriate content type
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }

    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Return the raw content
    return res.send(response.data);
  } catch (error) {
    console.error('Error proxying resource:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unknown error'
    });
  }
});

// Process HTML content to make it work in an iframe
function processHtml(html, baseUrl) {
  try {
    // Parse the HTML
    const $ = cheerio.load(html);

    // Add base tag if it doesn't exist
    if (!$('base').length) {
      $('head').prepend(`<base href="${baseUrl}">`);
    }

    // Add our proxy script to handle clicks and form submissions
    $('head').append(`
      <script>
        // Prevent navigation away from the iframe
        window.addEventListener('click', function(e) {
          const target = e.target.closest('a');
          if (target && target.href && !target.getAttribute('target')) {
            e.preventDefault();
            // Signal to parent that a link was clicked
            window.parent.postMessage({
              type: 'link-click',
              href: target.href
            }, '*');
          }
        }, true);

        // Prevent form submissions
        window.addEventListener('submit', function(e) {
          e.preventDefault();
          // Signal to parent that a form was submitted
          const form = e.target;
          const formData = new FormData(form);
          const data = {};
          for (let [key, value] of formData.entries()) {
            data[key] = value;
          }
          window.parent.postMessage({
            type: 'form-submit',
            action: form.action || window.location.href,
            method: form.method || 'GET',
            data: data
          }, '*');
        }, true);
      </script>
    `);

    // Fix relative URLs in attributes
    const attributesToFix = ['src', 'href', 'action', 'data-src'];
    attributesToFix.forEach(attr => {
      $(`[${attr}]`).each((i, el) => {
        const value = $(el).attr(attr);
        if (value && !value.startsWith('data:') && !value.startsWith('#') && !value.startsWith('javascript:')) {
          try {
            // Convert to absolute URL
            const absoluteUrl = new URL(value, baseUrl).href;
            $(el).attr(attr, absoluteUrl);
          } catch (e) {
            // Invalid URL, leave as is
          }
        }
      });
    });

    // Add CSP meta tag to allow loading resources
    $('head').prepend(`
      <meta http-equiv="Content-Security-Policy" content="
        default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
        img-src * data: blob:;
        style-src * 'unsafe-inline';
        script-src * 'unsafe-inline' 'unsafe-eval';
        connect-src *;
      ">
    `);

    // Remove existing X-Frame-Options meta tags
    $('meta[http-equiv="X-Frame-Options"]').remove();

    return $.html();
  } catch (error) {
    console.error('Error processing HTML:', error);
    return html;
  }
}

// Get the title of the page
function getTitle(html) {
  try {
    const $ = cheerio.load(html);
    return $('title').text() || '';
  } catch (error) {
    return '';
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
