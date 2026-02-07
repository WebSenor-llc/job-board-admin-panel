// Vercel Serverless Function - Catch-all proxy for /api/*
export default async function handler(req, res) {
  const BACKEND_URL = 'http://ai-job-portal-dev-alb-1152570158.ap-south-1.elb.amazonaws.com';

  // Get the full path including query parameters
  const { path = [] } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  const targetUrl = `${BACKEND_URL}/api/${apiPath}`;

  console.log(`[Proxy] ${req.method} /api/${apiPath} -> ${targetUrl}`);

  try {
    // Prepare request body if present
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    // Forward request to backend
    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        Authorization: req.headers['authorization'] || '',
      },
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

    // Return response
    return res.status(backendResponse.status).json(responseData);
  } catch (error) {
    console.error('[Proxy Error]:', error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      path: `/api/${apiPath}`,
    });
  }
}
