// ABOUTME: Emoji bubbles that rise when a change moves the debt: happy ones when it falls, worried ones
// ABOUTME: (pigs, cash, charts, crosses, bankers) when it rises. Pure: randomness is passed in.

export type Mood = 'happy' | 'worried';

export const HAPPY = ['😀', '🎉', '👍', '🥳', '💚', '✨'];
export const WORRIED = ['🐷', '💸', '📈', '❌', '🏦', '🤵'];
export const BUBBLE_COUNT = 4;

export type Bubble = {
	emoji: string;
	/** Horizontal position, % of the screen width. */
	left: number;
	/** Seconds before the bubble starts rising. */
	delay: number;
	/** Seconds the bubble takes to rise. */
	duration: number;
	/** Size in rem. */
	size: number;
};

export function bubblesFor(mood: Mood, random: () => number): Bubble[] {
	const emojis = mood === 'happy' ? HAPPY : WORRIED;
	return Array.from({ length: BUBBLE_COUNT }, () => ({
		emoji: emojis[Math.floor(random() * emojis.length)],
		left: 5 + random() * 90,
		delay: random() * 0.5,
		duration: 1.6 + random() * 0.8,
		size: 1.1 + random() * 0.5
	}));
}
