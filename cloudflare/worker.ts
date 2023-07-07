import websites from '../assets/websites'
import notfound from '../assets/notfound'
import localhost from '../assets/localhost'
import handler from '../handler'

export default {
	async fetch(request: Request) {
		const icon = await handler(request.url, {
			websites,
			notfound,
			localhost,
		})

		return new Response(icon, {
			status: 200,
			headers: {
				'access-control-allow-origin': '*',
				'cache-control': 'public, maxage=3600',
			},
		})
	},
}
