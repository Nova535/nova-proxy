// api/online-access.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST with JSON body.' });
  }

  try {
    // JSON body z App Inventor
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { model, messages, temperature } = body || {};

    if (!model || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing "model" or "messages" array.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not set on Vercel.' });
    }

    // Volanie OpenAI
    const resp = await (await import('node-fetch')).default('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, temperature })
    });

    const data = await resp.text(); // vraciame presne to, čo príde
    res.status(resp.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Proxy error' });
  }
}
