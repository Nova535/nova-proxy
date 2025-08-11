online-access.js
export default async function handler(req, res) {
  const fetch = (await import('node-fetch')).default;
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
