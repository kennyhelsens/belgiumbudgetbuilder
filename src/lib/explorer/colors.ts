// ABOUTME: Fixed colour slot per government, following the validated categorical palette order (--series-1..8).
// ABOUTME: A line (e.g. "flanders.education") uses the slot of its government.
const SLOTS: Record<string, number> = {
	federal: 1,
	'social-security': 2,
	flanders: 3,
	wallonia: 4,
	'wallonia-brussels-federation': 5,
	brussels: 6,
	'german-speaking-community': 7,
	local: 8
};

export function colorSlot(id: string): number {
	const government = id.split('.')[0];
	const slot = SLOTS[government];
	if (slot === undefined) throw new Error(`colorSlot: unknown government "${government}"`);
	return slot;
}
