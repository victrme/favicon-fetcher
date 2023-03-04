import fetch from 'node-fetch'
import * as htmlparser2 from 'htmlparser2'
import websites from '../assets/websites.json'
import { isnotfound, localhost } from '../assets/icons';

function stringToURL(str: string) {
	try {
		return new URL(str)
	} catch (error) {
		console.error('Query is not valid: ', str)
	}
}

function getURLFromWebsiteList(url: string, query: string) {
	for (let i = 0; i < websites.length; i++) {
		if (query.includes(websites[i].domain)) {
			return websites[i].url
		}
	} return '';
}

async function getHTML(url: string) {
	try {
		// Fetches with a timeout to avoid waiting for nothing
		// Type issue: https://github.com/node-fetch/node-fetch/issues/1652
		const signal = AbortSignal.timeout(3000) as any
		const response = await fetch(url, { signal })

		if (response.status === 200) {
			const html = await response.text()
			return html
		}
	} catch (error) {
		console.warn('Website loaded for too long')
		console.error(error)
	}

	console.warn("Couldn't get html")
	return '<nothing />'
}

async function getManifest(path: string) {
	try {
		const manifest = await fetch(path)
		const json = await manifest.json()
		return json
	} catch (error) {
		console.log('Couldnt get manifest')
	}
}

function parseManifest(json?: { icons?: { src: string; sizes: string }[] }) {
	if (json?.icons) {
		const icons = json.icons.map((ico) => {
			return {
				href: ico.src,
				size: parseInt(ico.sizes?.split('x')[0]) || 0,
			}
		})

		return icons.sort((a, b) => b.size - a.size)[0].href
	}

	return ''
}

function parseHTMLHead(html: string) {
	let result = {
		manifest: '',
		icons: [
			{
				href: '/favicon.ico',
				size: 16,
				touch: false,
			},
		],
	}

	const parser = new htmlparser2.Parser({
		onopentag(name, attributes) {
			if (name !== 'link') return

			const { rel, href, sizes } = attributes

			if (rel?.toLocaleLowerCase() === 'manifest') {
				result.manifest = href
			}

			if (rel?.toLocaleLowerCase().includes('icon')) {
				result.icons.push({
					href,
					size: parseInt(sizes?.split('x')[0]) || 0,
					touch: !!rel?.toLocaleLowerCase().match(/apple-touch-icon|fluid-icon/g),
				})
			}
		},
	})

	parser.write(html)
	parser.end()

	return result
}

function createFullPath(url: string, query: string) {
	const { hostname, protocol, pathname } = new URL(query)

	if (url === '') return url

	// It means (https:)//
	if (url.startsWith('//')) {
		url = `${protocol}${url}`
	}

	// If icon from root, only add protocol & hostname
	// Absolute path, also gets pathname
	if (!url.startsWith('http')) {
		url = `${protocol}//${hostname}${url.startsWith('/') ? '' : pathname + '/'}${url}`
	}

	return url
}

async function isIconFetchable(url: string) {
	if (!stringToURL(url)) {
		return false
	}

	try {
		const response = await fetch(url)
		if (response.status === 200) {
			return true
		}
	} catch (error) {
		console.warn("Couldn't verify icon")
		console.error(error)
	}

	return false
}

export async function handler(event: any) {
	const response = {
		statusCode: 200,
		body: '',
		headers: {
			'access-control-allow-origin': '*',
		},
	}

	const query = event.path.replace('/get/', '')
	let res = ''

	// Is locahost
	if (query.startsWith('localhost') || query.startsWith('http://localhost')) {
		return { ...response, body: localhost }
	}

	// Website is in list
	res = getURLFromWebsiteList(res, query)
	if (res.length > 0) {
		return { ...response, body: res }
	}

	// Fetch from website
	if (stringToURL(query)) {
		const html = await getHTML(query)
		const { manifest, icons } = parseHTMLHead(html)

		// Is there a touch icon ?
		if (icons.some((ico) => ico.touch)) {
			res = icons.filter((ico) => ico.touch)[0].href
		}

		// Is manifest available ?
		else if (manifest.length > 0) {
			const path = createFullPath(manifest, query)
			const json = await getManifest(path)
			res = parseManifest(json as any)
		}

		// Is there another icon ?
		else if (icons.length > 0) {
			res = icons.sort((a, b) => b.size - a.size)[0].href
		}

		res = createFullPath(res, query)

		// Validate icon url
		if (await isIconFetchable(res)) {
			return { ...response, body: res }
		}
	}

	// Fallback
	const URL = stringToURL(query)
	res = `${URL?.protocol || 'http:'}//${URL?.hostname}/favicon.ico`

	// Validate icon url
	if (await isIconFetchable(res)) {
		return { ...response, body: res }
	}

	return { ...response, body: isnotfound }
}