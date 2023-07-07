import websites from '../../assets/websites.ts'
import notfound from '../../assets/notfound.ts'
import localhost from '../../assets/localhost.ts'

import handler from '../../handler.ts'

export default async (request: Request) => {
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
}
