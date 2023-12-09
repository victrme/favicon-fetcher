import favicon from '../../src/index.ts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Max-Age': '3600',
	'Cache-Control': 'public, max-age=604800, immutable',
})

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url ?? '')
		const type = url.searchParams.get('type') ?? 'text'
		const iconurl = url.pathname.replace('/get/', '').replace('/', '')

		if (type === 'blob') {
			const blob = await favicon.img(iconurl)
			headers.set('Content-Type', blob.type)

			return new Response(blob, { headers })
		}
		//
		else {
			const text = await favicon.url(iconurl)
			return new Response(text, { headers })
		}
	},
}
