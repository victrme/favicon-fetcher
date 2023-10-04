import handler from '../../src/index.ts'

export default async (request: Request) => {
	let query = ''

	try {
		query = new URL(request.url).pathname
		query = query.replace('/', '').replace('.netlify/internal/ef-cache/', '')
		query = query.startsWith('get/') ? query.replace('get/', '') : query
	} catch (_) {
		console.log('Not valid query')
	}

	const icon = await handler(query)

	return new Response(icon, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*',
			'Access-Control-Allow-Headers': '*',
			'cache-control': 'public, maxage=3600',
		},
	})
}
