// ABOUTME: Combines the JSON files of one budget year (sources, overview, outlook, history, revenue, one per government)
// ABOUTME: into a dataset. Validates the result against the schema and reports problems with file paths.
import { datasetSchema, type Dataset } from './schema.ts';

export function assembleDataset(files: Record<string, unknown>, year: number): Dataset {
	const root = `/data/${year}`;
	const required = (path: string) => {
		if (!(path in files)) throw new Error(`${path} is missing`);
		return files[path];
	};

	const entityPrefix = `${root}/entities/`;
	const entities = Object.entries(files)
		.filter(([path]) => path.startsWith(entityPrefix))
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([path, entity]) => {
			const expectedId = path.slice(entityPrefix.length).replace(/\.json$/, '');
			const id = (entity as { id?: unknown }).id;
			if (id !== expectedId) {
				throw new Error(`${path}: id "${String(id)}" does not match the file name`);
			}
			return entity;
		});

	const detailsPrefix = `${root}/details/`;
	const details = Object.entries(files)
		.filter(([path]) => path.startsWith(detailsPrefix))
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([path, item]) => {
			const expectedLine = path.slice(detailsPrefix.length).replace(/\.json$/, '');
			const line = (item as { line?: unknown }).line;
			if (line !== expectedLine) {
				throw new Error(`${path}: line "${String(line)}" does not match the file name`);
			}
			return item;
		});

	const result = datasetSchema.safeParse({
		year,
		sources: required(`${root}/sources.json`),
		overview: required(`${root}/overview.json`),
		outlook: required(`${root}/outlook.json`),
		history: required(`${root}/history.json`),
		revenue: required(`${root}/revenue.json`),
		entities,
		details
	});
	if (!result.success) {
		const details = result.error.issues
			.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
			.join('\n');
		throw new Error(`data/${year} is invalid:\n${details}`);
	}
	return result.data;
}
