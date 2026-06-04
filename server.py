"""Menu Scanner — static server + tiny JSON store.

Run:  python server.py
Stops with Ctrl+C.
"""
import json
import os
import re
import secrets
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

PORT = 8765
ROOT = os.path.dirname(os.path.abspath(__file__))
STORE_DIR = os.path.join(ROOT, "menus")
os.makedirs(STORE_DIR, exist_ok=True)

ID_RE = re.compile(r"^[a-zA-Z0-9]{4,16}$")


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):  # quieter
        print("[srv]", fmt % args)

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        m = re.match(r"^/api/menu/([a-zA-Z0-9]+)$", path)
        if m:
            mid = m.group(1)
            if not ID_RE.match(mid):
                return self._send_json(400, {"error": "bad id"})
            fp = os.path.join(STORE_DIR, mid + ".json")
            if not os.path.exists(fp):
                return self._send_json(404, {"error": "not found"})
            with open(fp, "r", encoding="utf-8") as f:
                data = json.load(f)
            return self._send_json(200, data)
        return super().do_GET()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/orders":
            # Return all orders with their statuses
            orders_file = os.path.join(ROOT, "kitchen_orders.json")
            data = {}
            if os.path.exists(orders_file):
                try:
                    with open(orders_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                except:
                    data = {}
            return self._send_json(200, data)
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/orders":
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 10_000:
                return self._send_json(400, {"error": "bad size"})
            raw = self.rfile.read(length)
            try:
                data = json.loads(raw.decode("utf-8"))
            except:
                return self._send_json(400, {"error": "bad json"})

            orderId = data.get("orderId", "")
            status = data.get("status", "")

            # Load existing orders
            orders_file = os.path.join(ROOT, "kitchen_orders.json")
            orders = {}
            if os.path.exists(orders_file):
                try:
                    with open(orders_file, "r", encoding="utf-8") as f:
                        orders = json.load(f)
                except:
                    orders = {}

            # Update or create order
            if orderId in orders:
                orders[orderId]["status"] = status
            else:
                # Create new order from request
                order_data = data.get("order", {})
                orders[orderId] = {
                    **order_data,
                    "status": status,
                    "id": orderId
                }

            # Save to file
            with open(orders_file, "w", encoding="utf-8") as f:
                json.dump(orders, f)

            print(f"[kitchen] Order {orderId} → {status}")
            return self._send_json(200, {"success": True})
        elif path == "/api/send-whatsapp":
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 100_000:
                return self._send_json(400, {"error": "bad size"})
            raw = self.rfile.read(length)
            try:
                data = json.loads(raw.decode("utf-8"))
            except Exception:
                return self._send_json(400, {"error": "bad json"})

            # For now, just log the order (in production, use Twilio/WhatsApp API)
            wa_number = data.get("whatsappNumber", "unknown")
            message = data.get("message", "")
            cafe_name = data.get("cafeName", "")

            # Log the order
            log_file = os.path.join(ROOT, "orders.log")
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n{'='*60}\n")
                f.write(f"[{__import__('datetime').datetime.now().isoformat()}]\n")
                f.write(f"Cafe: {cafe_name}\n")
                f.write(f"WhatsApp: {wa_number}\n")
                f.write(f"Message:\n{message}\n")

            print(f"[whatsapp] Order logged for {wa_number}")
            # In production, integrate with Twilio or WhatsApp Business API here
            return self._send_json(200, {"success": True, "message": "Order sent successfully"})
        elif path == "/api/save":
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 2_000_000:
                return self._send_json(400, {"error": "bad size"})
            raw = self.rfile.read(length)
            try:
                data = json.loads(raw.decode("utf-8"))
            except Exception:
                return self._send_json(400, {"error": "bad json"})
            # Reuse id if client sent one and it's valid
            mid = data.get("_id") if isinstance(data, dict) else None
            if not (isinstance(mid, str) and ID_RE.match(mid)):
                mid = secrets.token_urlsafe(6)[:8]
            fp = os.path.join(STORE_DIR, mid + ".json")
            with open(fp, "w", encoding="utf-8") as f:
                json.dump(data, f)
            return self._send_json(200, {"id": mid})
        self._send_json(404, {"error": "no such route"})


if __name__ == "__main__":
    os.chdir(ROOT)
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Menu Scanner serving on http://0.0.0.0:{PORT}")
    print(f"  Admin:  http://localhost:{PORT}/index.html")
    print(f"  Store:  {STORE_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")
