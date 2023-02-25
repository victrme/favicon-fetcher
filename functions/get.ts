import fetch from 'node-fetch'
import * as htmlparser2 from 'htmlparser2'
import websites from '../assets/websites.json'

function stringToURL(str: string) {
	try {
		return new URL(str)
	} catch (error) {
		console.error('Query is not valid')
	}
}

function getURLFromWebsiteList(url: string, query: string) {
	websites.forEach((website) => {
		if (query.includes(website.domain)) {
			url = website.url
		}
	})

	return url
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

function getIconPathFromHTML(html: string) {
	let hasTouchIcon = false
	let icon = ''

	const parser = new htmlparser2.Parser({
		onopentag(name, attributes) {
			if (name !== 'link') return

			// console.log(attributes)
			const { rel, href } = attributes

			if (rel?.toLocaleLowerCase().match(/apple-touch-icon|fluid-icon/g)) {
				hasTouchIcon = true
				icon = href
			}

			if (rel?.toLocaleLowerCase().match(/icon|shortcut icon/g) && !hasTouchIcon) {
				icon = href
			}
		},
	})

	parser.write(html)
	parser.end()

	return icon
}

function toAbsolutePath(url: string, query: string) {
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
	const query = event.path.replace('/get/', '')
	let res = ''

	res = getURLFromWebsiteList(res, query)

	// Fetch html links only if it is not found in list
	if (res === '' && stringToURL(query)) {
		const html = await getHTML(query)
		res = getIconPathFromHTML(html)
		res = toAbsolutePath(res, query)
	}

	// Validate icon url
	if ((await isIconFetchable(res)) === false) {
		res = ''
	}

	// Fallback
	if (res === '') {
		const URL = stringToURL(query)
		res = 'https://icons.duckduckgo.com/ip3/' + URL?.hostname + '.ico'
	}

	return {
		statusCode: 200,
		body: res,
		headers: {
			'access-control-allow-origin': '*',
		},
	}
}
