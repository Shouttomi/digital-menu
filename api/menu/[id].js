// GET /api/menu/:id  — fetch a stored menu from Vercel Blob.
import { list } from '@vercel/blob';

const ID_RE = /^[A-Za-z0-9_-]{4,16}$/;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { id } = req.query;
  if (!id || !ID_RE.test(id)) {
    return res.status(400).json({ error: 'bad id' });
  }

  const pathname = `menus/${id}.json`;
  let match;
  try {
    const { blobs } = await list({ prefix: pathname, limit: 100 });
    match = blobs.find((b) => b.pathname === pathname);
  } catch (e) {
    return res.status(500).json({ error: 'store failed', detail: String((e && e.message) || e) });
  }
  if (!match) {
    return res.status(404).json({ error: 'not found' });
  }

  try {
    const r = await fetch(match.url, { cache: 'no-store' });
    if (!r.ok) return res.status(404).json({ error: 'not found' });
    const json = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(json);
  } catch {
    return res.status(500).json({ error: 'read failed' });
  }
}
