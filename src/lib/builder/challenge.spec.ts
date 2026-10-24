// ABOUTME: Tests for the "find 10 billion" challenge: how far the visitor's choices get towards the goal, and the line
// ABOUTME: that goes with a shared budget, naming what the choices do to the deficit.
import { describe, expect, it } from 'vitest';
import { HEADLINE_EUR_MILLION } from '../intro/facts.ts';
import { challengeStatus, shareTitle } from './challenge.ts';

describe('challengeStatus', () => {
	it('asks for a first choice when nothing has changed', () => {
		expect(challengeStatus(0, false)).toEqual({ kind: 'empty' });
	});

	it('shows how much of the goal is found, as a share', () => {
		expect(challengeStatus(2500, true)).toEqual({ kind: 'progress', found: 2500, share: 0.25 });
	});

	it('counts choices that cancel each other out as progress of nothing', () => {
		expect(challengeStatus(0, true)).toEqual({ kind: 'progress', found: 0, share: 0 });
	});

	it('says when the choices make the deficit bigger', () => {
		expect(challengeStatus(-800, true)).toEqual({ kind: 'worse', amount: 800 });
	});

	it('is done once the goal is reached', () => {
		expect(challengeStatus(HEADLINE_EUR_MILLION, true)).toEqual({
			kind: 'done',
			found: HEADLINE_EUR_MILLION
		});
	});
});

describe('shareTitle', () => {
	it('names what the budget finds', () => {
		expect(shareTitle('en', 2400)).toBe('My Belgian budget finds €2.4 billion. Can you do better?');
	});

	it('names how much bigger the deficit gets', () => {
		expect(shareTitle('nl', -300)).toBe(
			'Mijn Belgische begroting maakt het tekort € 300 miljoen groter. Kun jij beter?'
		);
	});

	it('has a plain title when the balance does not move', () => {
		expect(shareTitle('fr', 0)).toBe('Mon budget belge. Ferez-vous mieux ?');
	});
});
