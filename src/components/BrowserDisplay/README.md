# BrowserDisplay Component

A robust component for displaying external websites within your application, bypassing CORS restrictions and X-Frame-Options limitations.

## Features

- **Server-side Proxy**: Uses a server-side proxy to fetch website content
- **CORS Bypass**: Works with websites that have CORS restrictions
- **X-Frame-Options Bypass**: Works with websites that set X-Frame-Options headers
- **Interactive**: Captures link clicks and form submissions
- **Error Handling**: Provides clear error messages and retry functionality
- **Responsive**: Adapts to different screen sizes

## Installation

1. Copy the `BrowserDisplay` component to your project
2. Copy the API routes for the proxy functionality
3. Install the required dependencies:

```bash
npm install axios cheerio
```

## Usage

```tsx
import BrowserDisplay from '@/components/BrowserDisplay';

const MyComponent = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Website Display</h1>
      
      <BrowserDisplay
        url="https://example.com"
        height={600}
        onLoad={() => console.log('Website loaded')}
        onError={(error) => console.error('Error loading website:', error)}
      />
    </div>
  );
};

export default MyComponent;
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `url` | string | The URL to display |
| `height` | string \| number | The height of the browser display (default: '600px') |
| `width` | string \| number | The width of the browser display (default: '100%') |
| `onLoad` | function | Callback function called when the website is loaded |
| `onError` | function | Callback function called when an error occurs |

## How It Works

1. The component sends a request to the server-side proxy API
2. The proxy fetches the website content using axios
3. The HTML content is processed using cheerio to:
   - Fix relative URLs
   - Add a base tag
   - Add scripts to handle link clicks and form submissions
   - Remove X-Frame-Options headers
   - Add a Content Security Policy that allows resources to load
4. The processed HTML is returned to the client
5. The client displays the HTML in an iframe

## API Routes

### `/api/proxy/url`

Fetches a URL and processes the HTML to make it work in an iframe.

**Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "javascript": true,
    "timeout": 30000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "<!DOCTYPE html><html>...</html>",
    "contentType": "text/html",
    "baseUrl": "https://example.com",
    "title": "Example Domain"
  }
}
```

### `/api/proxy/resource`

Proxies resources like images, CSS, and JavaScript files.

**Request:**
```
GET /api/proxy/resource?url=https://example.com/image.jpg
```

**Response:**
The raw resource content with the appropriate content type header.

## Limitations

1. **JavaScript Execution**: Some websites rely heavily on JavaScript that may not work properly in an iframe
2. **Authentication**: Websites that require authentication may not work properly
3. **CAPTCHA**: Websites with CAPTCHA protection may block the proxy
4. **Rate Limiting**: Websites with rate limiting may block the proxy after multiple requests

## Security Considerations

1. **Content Security Policy**: The component adds a permissive CSP to allow resources to load
2. **Sandbox Attribute**: The iframe has a sandbox attribute to restrict certain behaviors
3. **Link Handling**: Links are intercepted to prevent navigation away from the application

## Demo

A demo page is available at `/browser-demo` that allows you to test the component with different URLs.
