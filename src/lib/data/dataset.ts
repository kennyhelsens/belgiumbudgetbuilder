// ABOUTME: Loads the budget data files from data/ at build time and returns the validated dataset for a year.
// ABOUTME: The JSON is bundled by Vite, so the static site needs no server to read it.
import { assembleDataset } from './assemble.ts';
import type { Dataset } from './schema.ts';

const files = import.meta.glob('/data/*/**/*.json', { eager: true, import: 'default' });

export function loadDataset(year: number): Dataset {
	return assembleDataset(files, year);
}
