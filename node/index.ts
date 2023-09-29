import websites from '../assets/websites'
import notfound from '../assets/notfound'
import localhost from '../assets/localhost'
import handler from '../handler'

export default async (url: string): Promise<string> => {
	return await handler(url, {
		websites,
		notfound,
		localhost,
	})
}
