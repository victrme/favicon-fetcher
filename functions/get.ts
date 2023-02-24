import fetch from 'node-fetch'
import * as htmlparser2 from 'htmlparser2'

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
	try {
		const response = await fetch(url)
		if (response.status !== 200) {
			return false
		}
	} catch (error) {
		console.warn("Couldn't verify icon")
		console.error(error)
		return false
	}

	return true
}

export async function handler(event: any) {
	const query = event.path.replace('/get/', '')
	const html = await getHTML(query)
	let res = ''

	res = getIconPathFromHTML(html)
	res = toAbsolutePath(res, query)
	res = (await isIconFetchable(res)) ? res : ''

	if (res === '') {
		res = 'https://icons.duckduckgo.com/ip3/' + new URL(query).hostname + '.ico'
	}

	return {
		statusCode: 200,
		body: res,
		headers: {
			'access-control-allow-origin': '*',
		},
	}
}
