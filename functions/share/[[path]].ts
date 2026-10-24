// ABOUTME: Cloudflare Pages Function at /share/<lang>/: the page behind a shared budget link, with a title and preview
// ABOUTME: for social networks, which then opens the budget on the site. Reads nothing but the link itself.
import { sharePage } from '../../src/lib/share/page.ts';

export async function onRequestGet({
	request,
	params
}: {
	request: Request;
	params: { path?: string | string[] };
}): Promise<Response> {
	const url = new URL(request.url);
	const lang = Array.isArray(params.path) ? (params.path[0] ?? '') : (params.path ?? '');
	const html = sharePage({
		origin: url.origin,
		lang,
		b: url.searchParams.get('b') ?? '',
		v: url.searchParams.get('v') ?? ''
	});
	return new Response(html, {
		headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' }
	});
}
