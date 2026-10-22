// ABOUTME: Where the end-to-end servers run: the static build on `vite preview`, and the build plus the Pages
// ABOUTME: Functions on `wrangler pages dev` with a local D1 database for the tracking tests.
export const PREVIEW_PORT = 4173;
export const PAGES_DEV_PORT = 8788;
export const PAGES_DEV_URL = `http://localhost:${PAGES_DEV_PORT}`;
/** Where `wrangler pages dev --persist-to` keeps local state. */
export const E2E_PERSIST = '.wrangler/e2e';
/** The same state as seen by wrangler's getPlatformProxy, which does not add the "v3" folder itself. */
export const E2E_PROXY_PERSIST = `${E2E_PERSIST}/v3`;
