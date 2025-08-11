export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'nova-access/1.0',
        'Accept': '*/*'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    res.setHeader('Content-Type', contentType || 'text/plain');
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message || String(error) });
  }
}
