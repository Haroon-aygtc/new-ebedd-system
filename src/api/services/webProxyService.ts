/**
 * Web Proxy Service
 * Provides functionality to proxy web requests and handle CORS issues
 */

import axios from 'axios';
import { getRandomUserAgent } from './userAgentService';
import * as cheerio from 'cheerio';

/**
 * Fetch a URL and return the content with modified links and resources
 * to work properly in an iframe
 */
export const fetchAndProxyUrl = async (url: string, options: any = {}) => {
  try {
    // Validate URL
    const targetUrl = new URL(url);
    
    // Set up request headers
    const headers = {
      'User-Agent': options.userAgent || getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': targetUrl.origin,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    // Make the request
    const startTime = Date.now();
    const response = await axios.get(url, {
      headers,
      timeout: options.timeout || 30000,
      maxRedirects: 5,
      responseType: 'text'
    });
    const responseTime = Date.now() - startTime;
    
    // Process the HTML content
    if (response.headers['content-type']?.includes('text/html')) {
      return processHtml(response.data, targetUrl.href, options);
    }
    
    // Return raw content for non-HTML responses
    return {
      content: response.data,
      contentType: response.headers['content-type'],
      responseTime,
      url: response.config.url || url,
      status: response.status,
      headers: response.headers
    };
  } catch (error) {
    console.error('Error in fetchAndProxyUrl:', error);
    throw error;
  }
};

/**
 * Process HTML content to make it work in an iframe
 */
const processHtml = (html: string, baseUrl: string, options: any = {}) => {
  try {
    // Parse the HTML
    const $ = cheerio.load(html);
    const baseUrlObj = new URL(baseUrl);
    
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
    
    // Fix inline styles with url()
    $('[style]').each((i, el) => {
      const style = $(el).attr('style');
      if (style && style.includes('url(')) {
        const newStyle = style.replace(/url\(['"']?([^'")]+)['"']?\)/g, (match, url) => {
          if (url.startsWith('data:') || url.startsWith('#')) return match;
          try {
            const absoluteUrl = new URL(url, baseUrl).href;
            return `url("${absoluteUrl}")`;
          } catch (e) {
            return match;
          }
        });
        $(el).attr('style', newStyle);
      }
    });
    
    // Fix CSS @import and url() in style tags
    $('style').each((i, el) => {
      let css = $(el).html();
      if (css) {
        // Fix @import
        css = css.replace(/@import\s+['"]([^'"]+)['"];/g, (match, url) => {
          try {
            const absoluteUrl = new URL(url, baseUrl).href;
            return `@import "${absoluteUrl}";`;
          } catch (e) {
            return match;
          }
        });
        
        // Fix url()
        css = css.replace(/url\(['"']?([^'")]+)['"']?\)/g, (match, url) => {
          if (url.startsWith('data:') || url.startsWith('#')) return match;
          try {
            const absoluteUrl = new URL(url, baseUrl).href;
            return `url("${absoluteUrl}")`;
          } catch (e) {
            return match;
          }
        });
        
        $(el).html(css);
      }
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
    
    // Return the processed HTML
    return {
      content: $.html(),
      contentType: 'text/html',
      baseUrl,
      title: $('title').text() || baseUrl
    };
  } catch (error) {
    console.error('Error processing HTML:', error);
    return {
      content: html,
      contentType: 'text/html',
      baseUrl,
      error: error.message
    };
  }
};

/**
 * Proxy a resource (image, CSS, JS, etc.)
 */
export const proxyResource = async (url: string, options: any = {}) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: options.timeout || 30000,
      headers: {
        'User-Agent': options.userAgent || getRandomUserAgent(),
        'Referer': new URL(url).origin
      }
    });
    
    return {
      content: response.data,
      contentType: response.headers['content-type'],
      status: response.status
    };
  } catch (error) {
    console.error('Error proxying resource:', error);
    throw error;
  }
};
