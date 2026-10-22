// ABOUTME: Prepares the local D1 database the tracking tests use, with the same migrations as production.
// ABOUTME: Runs once before the end-to-end tests.
import { getPlatformProxy } from 'wrangler';
import type { Db } from '../src/lib/tracking/store.ts';
import { applyMigrations } from '../src/lib/tracking/test-db.ts';
import { E2E_PROXY_PERSIST } from './servers.ts';

export default async function globalSetup() {
	const { env, dispose } = await getPlatformProxy<{ DB: Db }>({
		configPath: 'wrangler.local.toml',
		persist: { path: E2E_PROXY_PERSIST }
	});
	try {
		await applyMigrations(env.DB);
	} finally {
		await dispose();
	}
}
