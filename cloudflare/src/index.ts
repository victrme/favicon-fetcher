import favicon from '../../src/index.ts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Max-Age': '3600',
})

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url ?? '')
		const path = url.pathname
		const type = path.startsWith('/blob') ? 'blob' : 'text'
		let iconurl = ''

		for (const param of ['/blob/', '/text/', '/get/', '/']) {
			if (path.startsWith(param)) {
				iconurl = path.replace(param, '')
				break
			}
		}

		if (type === 'blob') {
			const blob = await favicon.img(iconurl)
			headers.set('Content-Type', blob.type)
			headers.set('Cache-Control', 'public, max-age=604800, immutable')
			return new Response(blob, { headers })
		}

		if (type === 'text') {
			const text = await favicon.url(iconurl)
			headers.set('Cache-Control', 'public, max-age=3600, immutable')
			return new Response(text, { headers })
		}
	},
}
