// POST /api/save  — persist a menu to Vercel Blob, return its short id.
// Mirrors the local server.py contract: body is the menu JSON (optionally
// carrying `_id` to reuse an existing id); responds with { id }.
import { put } from '@vercel/blob';

const ID_RE = /^[A-Za-z0-9_-]{4,16}$/;

function newId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  let data;
  try {
    data = await readBody(req);
  } catch {
    return res.status(400).json({ error: 'bad json' });
  }
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'bad payload' });
  }

  const id = typeof data._id === 'string' && ID_RE.test(data._id) ? data._id : newId();
  const { _id, ...doc } = data;

  try {
    await put(`menus/${id}.json`, JSON.stringify(doc), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
  } catch (e) {
    return res.status(500).json({ error: 'store failed', detail: String((e && e.message) || e) });
  }

  return res.status(200).json({ id });
}
