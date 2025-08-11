apix/web.js
export default async function handler(req, res) {
  // Povolenie CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Získanie cieľovej URL
  let target = null;
  try {
    if (req.method === 'GET') {
      target = req.query.url;
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      target = body?.url;
    }
  } catch {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  if (!target) return res.status(400).json({ error: 'Missing "url" parameter.' });

  // Validácia URL
  let parsed;
  try { parsed = new URL(target); }
  catch { return res.status(400).json({ error: 'Invalid URL.' }); }
  if (!/^https?:$/.test(parsed.protocol)) {
    return res.status(400).json({ error: 'Only http/https allowed.' });
  }
  const host = parsed.hostname;
  const localNet = /(^localhost$)|(^127\.)|(^10\.)|(^192\.168\.)|(^172\.(1[6-9]|2[0-9]|3[0-1]))/;
  if (localNet.test(host)) return res.status(403).json({ error: 'Blocked host.' });

  // Timeout a fetch
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const r = await fetch(target, {
      method: 'GET',
      headers: {
        'User-Agent': 'nova-proxy/1.0 (+https://vercel.app)',
        'Accept': '*/*'
      },
      signal: controller.signal
    });

    const ct = r.headers.get('content-type') || 'text/plain';
    const text = await r.text();

    // Raw mód
    const mode = (req.query.mode || '').toLowerCase();
    if (mode === 'raw') {
      res.setHeader('Content-Type', ct);
      return res.status(r.status).send(text);
    }

    // JSON mód
    return res.status(200).json({
      status: r.status,
      contentType: ct,
      url: target,
      body: text
    });
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'Fetch timeout' : (e.message || 'Fetch failed');
    return res.status(500).json({ error: msg });
  } finally {
    clearTimeout(timeout);
  }
}
