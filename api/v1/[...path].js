// Vercel Serverless Function - Proxy to AWS Backend
// Handles: /api/v1/* → AWS backend
export default async function handler(req, res) {
  const BACKEND_URL = 'http://ai-job-portal-dev-alb-1152570158.ap-south-1.elb.amazonaws.com';

  // Get the path from the request
  const { path = [] } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  const targetUrl = `${BACKEND_URL}/api/v1/${apiPath}`;

  console.log(`[Proxy] ${req.method} /api/v1/${apiPath} -> ${targetUrl}`);

  try {
    // Prepare headers
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };

    // Add authorization header if present
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    // Prepare request body
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    // Forward request to backend
    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Get response data
    const contentType = backendResponse.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await backendResponse.json();
    } else {
      responseData = await backendResponse.text();
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Return response
    return res.status(backendResponse.status).json(responseData);
  } catch (error) {
    console.error('[Proxy Error]:', error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      path: `/api/v1/${apiPath}`,
    });
  }
}
