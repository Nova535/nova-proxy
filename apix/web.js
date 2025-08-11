export default async function handler(req, res) {
  // Povolenie CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Získanie cieľovej URL
  let target = null;
  try {
    if (req.method === 'GET') {
      target = req.query.url;
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      target = body.url;
    }
  } catch {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }

  if (!target) {
    return res.status(400).json({ error: 'Missing "url" parameter.' });
  }

  try {
    const fetchResponse = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body)
    });

    const data = await fetchResponse.text();
    res.status(fetchResponse.status).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed.', details: error.message });
  }
}
