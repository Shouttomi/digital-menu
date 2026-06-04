// Vercel Serverless Function for /api/orders
// In-memory store for orders (persists during function lifetime)
let ordersStore = {};

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET /api/orders — return all orders
  if (req.method === 'GET') {
    console.log('GET /api/orders', Object.keys(ordersStore));
    return res.status(200).json(ordersStore);
  }

  // POST /api/orders — create or update order
  if (req.method === 'POST') {
    const { orderId, status, order } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId and status required' });
    }

    // Create or update order
    if (ordersStore[orderId]) {
      ordersStore[orderId].status = status;
      console.log(`[kitchen] Order ${orderId} → ${status}`);
    } else {
      ordersStore[orderId] = {
        ...(order || {}),
        id: orderId,
        status: status
      };
      console.log(`[kitchen] NEW Order ${orderId}: ${status}`);
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
