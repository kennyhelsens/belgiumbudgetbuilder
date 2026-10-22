// ABOUTME: Cloudflare Pages Function at POST /api/events: stores a batch of anonymous tile clicks in D1.
// ABOUTME: Accepts only small, valid batches; reads nothing about the visitor besides the batch itself.
import { parseBatch } from '../../src/lib/tracking/events.ts';
import { storeBatch, type Db } from '../../src/lib/tracking/store.ts';

/** A full batch is about 4 kB; anything much larger is not from the site. */
const MAX_BODY_BYTES = 16_000;

export async function onRequestPost({
	request,
	env
}: {
	request: Request;
	env: { DB: Db };
}): Promise<Response> {
	const body = await request.text();
	if (body.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });
	let batch;
	try {
		batch = parseBatch(JSON.parse(body));
	} catch {
		return new Response(null, { status: 400 });
	}
	await storeBatch(env.DB, batch);
	return new Response(null, { status: 204 });
}
