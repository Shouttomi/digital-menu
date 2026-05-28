# digital-menu

A QR menu builder: a static admin page to design a menu, plus a customer view with multiple themes. Menus can be shared two ways:

- **Self-contained link** (`menu.html#d=...`) — the whole menu is compressed into the URL. Works with zero backend.
- **Short link** (`menu.html?id=...`) — the menu is saved server-side and referenced by a short id. Needs the API + storage below.

## Run locally

```
python server.py
```

Then open http://localhost:8765/index.html (admin) — `server.py` provides `/api/save` and `/api/menu/{id}` backed by JSON files in `menus/`.

## Deploy on Vercel

The repo ships Vercel serverless functions (`api/save.js`, `api/menu/[id].js`) backed by **Vercel Blob**, so the short `?id=` links work in production. `server.py` is only for local dev and is excluded from Vercel via `.vercelignore`.

One-time setup so the API can persist menus:

1. Import the GitHub repo into Vercel (Framework preset: **Other** — no build step needed).
2. In the project, go to **Storage → Create → Blob**, and connect the store to this project. Vercel automatically adds the `BLOB_READ_WRITE_TOKEN` env var.
3. **Redeploy** so the functions pick up the token.

If the Blob store isn't connected, saving simply fails gracefully and the QR falls back to the self-contained `#d=` link (which always works).

### Notes
- Keep the logo as a hosted image path rather than an uploaded data URL — uploads get embedded in the `#d=` fallback link and bloat the QR.
- The QR image is rendered by the external `api.qrserver.com` service (needs internet).
