import fetcher from '../../src/index.ts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Max-Age': '3600',
	'Cache-Control': 'public, s-maxage=604800, immutable',
})

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url)

		switch (url.pathname.slice(0, 6)) {
			case '/text/': {
				const text = await fetcher.text(url.pathname.slice(6))
				return new Response(text, { headers })
			}

			case '/icon/': {
				const blob = await fetcher.blob(url.pathname.slice(6))
				return new Response(blob, { headers })
			}

			default:
				return new Response(undefined, { status: 400 })
		}
	},
}
