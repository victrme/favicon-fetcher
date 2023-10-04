import handler from '../src/index'

export default {
	async fetch(request: Request) {
		let query = ''

		try {
			query = new URL(request.url).pathname
			query = query.replace('/', '')
			query = query.startsWith('get/') ? query.replace('get/', '') : query
		} catch (_) {
			console.log('Not valid query')
		}

		const icon = await handler(query)

		return new Response(icon, {
			status: 200,
			headers: {
				'access-control-allow-origin': '*',
				'cache-control': 'public, maxage=3600',
			},
		})
	},
}
