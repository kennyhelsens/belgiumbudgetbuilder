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
	/** The group a government belongs to, such as the federal level; lines have none. */
	group?: string;
};

/** The rectangle a group of governments takes on the map, e.g. the federal government and social security. */
export type GroupBox = {
	id: string;
	/** The governments in the group, in the order the map lays them out. */
	members: string[];
	x0: number;
	y0: number;
	x1: number;
	y1: number;
};

type Item = Omit<Tile, 'x0' | 'y0' | 'x1' | 'y1'>;
type Node = Item | { id?: string; children: Node[] };

export function mapTiles(
	data: Dataset,
	frame: { width: number; height: number; focus?: string }
): Tile[] {
	return leavesOf(layOut(frame.focus ? linesOf(data, frame.focus) : grouped(data), frame));
}

/** Where each group of governments sits on the map of Belgium; none inside one government. */
export function mapGroups(
	data: Dataset,
	frame: { width: number; height: number; focus?: string }
): GroupBox[] {
	if (frame.focus) return [];
	return (layOut(grouped(data), frame).children ?? [])
		.filter((node) => node.children)
		.map((node) => ({
			id: (node.data as { id: string }).id,
			members: node.leaves().map((leaf) => (leaf.data as Item).id),
			x0: node.x0,
			y0: node.y0,
			x1: node.x1,
			y1: node.y1
		}));
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
	return leavesOf(layOut(items, frame));
}

/** Lays out the items, or groups of items, so that every euro gets the same area. */
function layOut(items: Node[], frame: { width: number; height: number }) {
	const root = hierarchy<Node>({ children: items })
		.sum((node) => ('eurMillion' in node ? node.eurMillion : 0))
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	return treemap<Node>().tile(treemapSquarify).size([frame.width, frame.height])(root);
}

function leavesOf(laidOut: ReturnType<typeof layOut>): Tile[] {
	return laidOut.leaves().map((leaf) => ({
		...(leaf.data as Item),
		x0: leaf.x0,
		y0: leaf.y0,
		x1: leaf.x1,
		y1: leaf.y1
	}));
}

/** The governments, nested in their groups so that each group stays together on the map. */
function grouped(data: Dataset): Node[] {
	const items = governments(data);
	const groupOf = new Map(
		data.groups.flatMap((group) => group.members.map((member) => [member, group.id] as const))
	);
	const withGroup = items.map((item) => ({ ...item, group: groupOf.get(item.id) }));
	return [
		...data.groups
			.map((group) => ({
				id: group.id,
				children: withGroup.filter((item) => item.group === group.id)
			}))
			// An empty group would become a tile of its own.
			.filter((group) => group.children.length > 0),
		...withGroup.filter((item) => item.group === undefined)
	];
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
