// api/online-access.js
export default async function handler(req, res) {
  // CORS (nechaj aj v mobile, ale len pre test)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST is allowed.' });
  }

  // Bezpečné načítanie JSON tela
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch (_e) {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const { model, messages, temperature } = body;
  if (!model || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing "model" or "messages" array.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set on Vercel.' });
  }

  // Volanie OpenAI
  try {
    const resp = await (await import('node-fetch')).default('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature })
    });

    const text = await resp.text(); // vraciame presne to, čo príde
    res.status(resp.status).send(text);
  } catch (e) {
    res.status(500).json({ error: 'Proxy error', message: String(e) });
  }
}
