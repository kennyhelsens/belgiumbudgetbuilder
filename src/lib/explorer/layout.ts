// ABOUTME: Area-true treemap layout for the budget map: every euro gets the same amount of space.
// ABOUTME: Shows governments for Belgium as a whole, or one government's lines when zoomed in; transfers take no space.
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import { ownExpenditure } from '../data/consolidate.ts';
import type { Dataset, Line } from '../data/schema.ts';

export type Tile = {
	id: string;
	label: Line['label'];
	eurMillion: number;
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	/** True when the tile is a government that can be opened to show its lines. */
	zoomable: boolean;
};

type Item = Omit<Tile, 'x0' | 'y0' | 'x1' | 'y1'>;

export function mapTiles(
	data: Dataset,
	frame: { width: number; height: number; focus?: string }
): Tile[] {
	const items = frame.focus ? linesOf(data, frame.focus) : governments(data);
	const root = hierarchy<{ children?: Item[] } | Item>({ children: items })
		.sum((node) => ('eurMillion' in node ? node.eurMillion : 0))
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	const laidOut = treemap<{ children?: Item[] } | Item>()
		.tile(treemapSquarify)
		.size([frame.width, frame.height])(root);

	return laidOut.leaves().map((leaf) => ({
		...(leaf.data as Item),
		x0: leaf.x0,
		y0: leaf.y0,
		x1: leaf.x1,
		y1: leaf.y1
	}));
}

function governments(data: Dataset): Item[] {
	return data.entities
		.map((entity) => ({
			id: entity.id,
			label: entity.label,
			eurMillion: ownExpenditure(entity),
			zoomable: true
		}))
		.filter((item) => item.eurMillion > 0);
}

function linesOf(data: Dataset, entityId: string): Item[] {
	const entity = data.entities.find((e) => e.id === entityId);
	if (!entity) throw new Error(`mapTiles: unknown government "${entityId}"`);
	return entity.expenditure.lines
		.filter((line) => !line.transferTo && line.amount.eurMillion > 0)
		.map((line) => ({
			id: line.id,
			label: line.label,
			eurMillion: line.amount.eurMillion,
			zoomable: false
		}));
}
