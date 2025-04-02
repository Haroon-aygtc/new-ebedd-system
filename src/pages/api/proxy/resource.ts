import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getRandomUserAgent } from '@/utils/userAgents';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
