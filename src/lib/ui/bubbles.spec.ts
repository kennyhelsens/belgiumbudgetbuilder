// ABOUTME: Unit tests for the emoji bubbles that rise when a change moves the debt: happy ones when it
// ABOUTME: falls, worried ones when it rises, spread across the screen with varied timing.
import { describe, expect, it } from 'vitest';
import { BUBBLE_COUNT, HAPPY, WORRIED, bubblesFor } from './bubbles.ts';

/** A repeatable stand-in for Math.random. */
function sequence(...values: number[]) {
	let i = 0;
	return () => values[i++ % values.length];
}

describe('bubblesFor', () => {
	it('uses only happy emojis when the debt falls', () => {
		const bubbles = bubblesFor('happy', Math.random);
		expect(bubbles).toHaveLength(BUBBLE_COUNT);
		for (const bubble of bubbles) expect(HAPPY).toContain(bubble.emoji);
	});

	it('uses only worried emojis when the debt rises', () => {
		for (const bubble of bubblesFor('worried', Math.random))
			expect(WORRIED).toContain(bubble.emoji);
	});

	it('keeps every bubble on screen and staggers them', () => {
		const bubbles = bubblesFor('happy', sequence(0, 0.999, 0.5));
		for (const bubble of bubbles) {
			expect(bubble.left).toBeGreaterThanOrEqual(5);
			expect(bubble.left).toBeLessThanOrEqual(95);
			expect(bubble.delay).toBeGreaterThanOrEqual(0);
			expect(bubble.delay).toBeLessThanOrEqual(0.5);
		}
		expect(new Set(bubbles.map((b) => b.left)).size).toBeGreaterThan(1);
	});
});
