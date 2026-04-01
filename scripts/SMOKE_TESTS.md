Smoke tests for mass-actions endpoints

Prerequisites
- Node 18+ (for fetch in Node) or a modern Node that supports global `fetch`.
- Dev server running (`pnpm dev`). By default Next runs on port 3000; this repo's dev server may select an alternate port if 3000 is busy.

Running the smoke tests

1. Start the dev server (from repo root):

```powershell
pnpm dev
```

2. If the dev server selects a different port (e.g., 3001 / 3010), set `BASE_URL` before running tests. Example for PowerShell:

```powershell
$env:BASE_URL='http://localhost:3010'
node scripts/smoke-test.js
```

3. The smoke test script sends a small POST to each scaffolded endpoint under `/api/mass-actions/` and prints the response.

Dev auth
- For local runs the script includes a development auth cookie and `x-user-*` headers so the server accepts the requests (see `scripts/smoke-test.js`).
- The middleware change that allows `/api/mass-actions` to bypass auth is gated to non-production only, so it is safe for local testing.

Interpreting results
- Expected: 200 responses with JSON echoes from each endpoint:
  - `/api/mass-actions/tags` → { success: true, message: 'Tag operation queued', data: { ... } }
  - `/api/mass-actions/dedupe` → { success: true, data: { duplicates: [...], inspectedIds: [...] } }
  - `/api/mass-actions/update` → { success: true, message: 'Update operation accepted', data: { ... } }

Troubleshooting
- If you receive a 307 redirect to `/` (login), ensure the script is run against the same port as the running dev server and that `NODE_ENV` is not `production`.
- If a headers timeout (UND_ERR_HEADERS_TIMEOUT) occurs, the dev server may be compiling; wait a few seconds and retry.

Cleaning up
- No persistent data is modified by these scaffolds. If you implement real updates later, ensure the smoke tests are updated accordingly.

