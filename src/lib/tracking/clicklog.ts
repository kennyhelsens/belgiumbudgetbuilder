// ABOUTME: Collects the tile clicks of one page visit and sends them in small batches to /api/events.
// ABOUTME: The session id is random and lives only in memory: nothing is stored on the visitor's device.
import type { Locale } from '../i18n/locales.ts';
import type { Action, Click } from './events.ts';

/** True unless the browser asks not to be tracked (Global Privacy Control or Do Not Track). */
export function trackingAllowed(signals: {
	globalPrivacyControl?: boolean;
	doNotTrack?: string | null;
}): boolean {
	return signals.globalPrivacyControl !== true && signals.doNotTrack !== '1';
}

export class ClickLog {
	readonly session = crypto.randomUUID();
	#queue: Click[] = [];
	#seq = 0;
	#timer: ReturnType<typeof setTimeout> | undefined;
	readonly #delayMs: number;
	readonly #maxBatch: number;

	/** `send` delivers one batch as JSON text, e.g. with navigator.sendBeacon. */
	constructor(
		readonly locale: Locale,
		private readonly send: (body: string) => void,
		{ delayMs = 4000, maxBatch = 20 }: { delayMs?: number; maxBatch?: number } = {}
	) {
		this.#delayMs = delayMs;
		this.#maxBatch = maxBatch;
	}

	record(line: string, action: Action, percent: number): void {
		this.#queue.push({ line, action, percent, seq: this.#seq++ });
		clearTimeout(this.#timer);
		if (this.#queue.length >= this.#maxBatch) this.flush();
		else this.#timer = setTimeout(() => this.flush(), this.#delayMs);
	}

	/** Sends what is queued now, e.g. when the page is hidden or closed. */
	flush(): void {
		clearTimeout(this.#timer);
		if (this.#queue.length === 0) return;
		const events = this.#queue;
		this.#queue = [];
		this.send(JSON.stringify({ session: this.session, locale: this.locale, events }));
	}
}
