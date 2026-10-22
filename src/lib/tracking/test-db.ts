// ABOUTME: Prepares a local D1 database for tests with the same migrations production runs, from migrations/*.sql.
// ABOUTME: Used by the integration tests and the end-to-end setup; never bundled into the site or the API.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Db } from './store.ts';

export async function applyMigrations(db: Db, dir = 'migrations'): Promise<void> {
	for (const file of readdirSync(dir).sort()) {
		const sql = readFileSync(join(dir, file), 'utf8').replace(/^--.*$/gm, '');
		for (const statement of sql.split(';').map((s) => s.trim())) {
			if (statement) await db.prepare(statement).run();
		}
	}
}
