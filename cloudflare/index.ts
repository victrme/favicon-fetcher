import favicon from '../package/src/index.ts'

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
		const endpoint = path.slice(0, path.indexOf('http'))
		const type = endpoint.includes('/blob') ? 'blob' : 'text'
		const target = addMissingProtocolSlash(path.slice(Math.max(0, path.indexOf('http'))))

		if (type === 'blob') {
			const blob = await favicon.img(target)
			headers.set('Content-Type', blob.type)
			headers.set('Cache-Control', 'public, max-age=604800, immutable')
			return new Response(blob, { headers })
		}

		if (type === 'text') {
			const text = await favicon.url(target)
			headers.set('Cache-Control', 'public, max-age=3600, immutable')
			return new Response(text, { headers })
		}

		return new Response(undefined, { status: 400, headers })
	},
}

function addMissingProtocolSlash(url: string) {
	const missingSlashRegex = /(https?:\/)(?!\/)([^\/]*)/
	return url.replace(missingSlashRegex, (_, protocol, rest) => `${protocol}/${rest}`)
}
