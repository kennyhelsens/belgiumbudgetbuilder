// ABOUTME: Tests for the intro's text: every scene filled in with the real figures, in NL, FR and EN,
// ABOUTME: with no placeholder left behind.
import { describe, expect, it } from 'vitest';
import { loadDataset } from '../data/dataset.ts';
import { LOCALES } from '../i18n/locales.ts';
import { introFacts } from './facts.ts';
import { introScenes, SCENE_COUNT } from './scenes.ts';

const data = loadDataset(2026);
const facts = introFacts(data);

describe('introScenes', () => {
	for (const locale of LOCALES) {
		it(`${locale}: fills in every scene`, () => {
			const scenes = introScenes(facts, data.year, locale);
			expect(scenes).toHaveLength(SCENE_COUNT);
			for (const scene of scenes) {
				expect(`${scene.title} ${scene.body}`).not.toMatch(/[{}]/);
			}
		});
	}

	it('en: tells the story with the figures from the data', () => {
		const [headline, all, ten, gap, why, bill] = introScenes(facts, data.year, 'en').map(
			(scene) => ({
				title: scene.title,
				body: scene.body.replace(/\u00a0/g, ' ')
			})
		);
		expect(headline.title).toBe('‘Government looks for 10 billion’');
		expect(all.body).toContain('€355.2 billion in 2026');
		expect(ten.body).toContain('2.8% of all spending');
		expect(ten.body).toContain('€843 for every inhabitant');
		expect(gap.body).toContain('€33.7 billion more');
		expect(gap.body).toContain('closes 30% of that gap; €23.7 billion of deficit remains');
		expect(why.title).toBe('How did we get here?');
		expect(why.body).toContain(
			'According to the National Bank of Belgium, the deficit grew by €18 billion between 2016 and 2025'
		);
		expect(why.body).toContain('€12 billion less revenue and €9 billion more spending');
		expect(why.body).toContain('federal level (€11 billion)');
		expect(why.body).toContain('communities and regions (€8 billion)');
		expect(bill.body).toContain('€16.6 billion a year');
		expect(bill.body).toContain('132.7% of GDP by 2036');
	});

	it('nl and fr: write numbers the local way', () => {
		expect(introScenes(facts, data.year, 'nl')[2].body).toContain('2,8%');
		// Amounts never break across lines.
		expect(introScenes(facts, data.year, 'nl')[1].body).toContain('€\u00a0355,2\u00a0miljard');
		expect(introScenes(facts, data.year, 'fr')[1].body).toContain('355,2\u00a0milliards\u00a0€');
	});
});
