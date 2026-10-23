// ABOUTME: Area-true treemap layout for the budget map: every euro gets the same amount of space.
// ABOUTME: Governments for Belgium as a whole, one government's lines when zoomed in (transfers take no space), or revenue.
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
	/** False for a line or revenue no budget decision can change, such as interest on debt. */
	adjustable: boolean;
	/** What a line pays for, which sets its colour; governments have none. */
	theme?: Line['theme'];
};

type Item = Omit<Tile, 'x0' | 'y0' | 'x1' | 'y1'>;

export function mapTiles(
	data: Dataset,
	frame: { width: number; height: number; focus?: string }
): Tile[] {
	return layOut(frame.focus ? linesOf(data, frame.focus) : governments(data), frame);
}

/** General government revenue, one tile per type (personal income tax, VAT and other indirect taxes, ...). */
export function revenueTiles(data: Dataset, frame: { width: number; height: number }): Tile[] {
	const items = data.revenue.types.map((type) => ({
		id: type.id,
		label: type.label,
		eurMillion: type.amount.eurMillion,
		zoomable: false,
		adjustable: type.adjustable !== false
	}));
	return layOut(items, frame);
}

function layOut(items: Item[], frame: { width: number; height: number }): Tile[] {
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
			zoomable: true,
			adjustable: entity.adjustable
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
			zoomable: false,
			adjustable: line.adjustable !== false,
			theme: line.theme
		}));
}

export type TooltipPlacement = { vertical: 'above' | 'below'; horizontal: 'left' | 'right' };

/** Where a tile's tooltip opens so it stays inside the map: towards the middle of the frame. */
export function tooltipPlacement(
	tile: Pick<Tile, 'x0' | 'y0' | 'x1' | 'y1'>,
	frame: { width: number; height: number }
): TooltipPlacement {
	return {
		vertical: (tile.y0 + tile.y1) / 2 > frame.height / 2 ? 'above' : 'below',
		horizontal: (tile.x0 + tile.x1) / 2 > frame.width / 2 ? 'right' : 'left'
	};
}
