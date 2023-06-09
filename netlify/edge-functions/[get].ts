import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'
import { isnotfound, localhost } from '../../assets/icons.ts'
import websites from '../../assets/websites.ts'

type Icon = {
	href: string
	size: number
	touch?: boolean
}

type Manifest = {
	icons?: {
		src: string
		sizes: string
	}[]
}

type ParsedHTML = {
	manifest: string
	icons: {
		href: string
		size: number
		touch: boolean
	}[]
}

function stringToURL(str: string) {
	try {
		return new URL(str)
	} catch (error) {
		console.warn(error)
	}
}

function sortClosestToSize(icons: Icon[], val = 144) {
	return icons.sort((a, b) => Math.abs(a.size - val) - Math.abs(b.size - val))
}

function getURLFromWebsiteList(query: string) {
	for (const { domain, url } of websites) {
		if (query.includes(domain)) {
			return url
		}
	}

	return ''
}

async function getHTML(url: string) {
	try {
		// Fetches with a timeout to avoid waiting for nothing
		// Type issue: https://github.com/node-fetch/node-fetch/issues/1652
		const signal = AbortSignal.timeout(4000)
		const response = await fetch(url, { signal })

		if (response.status === 200) {
			const html = await response.text()
			return html
		}
	} catch (error) {
		console.warn(error)
	}

	return null
}

async function getManifest(path: string) {
	try {
		const manifest = await fetch(path)
		const json = await manifest.json()
		return json
	} catch (_error) {
		console.warn('Couldnt get manifest')
		return {}
	}
}

function parseManifest(json: Manifest): Icon[] {
	if (!json?.icons) return []

	return json.icons.map((ico) => ({
		href: ico.src,
		size: parseInt(ico.sizes?.split('x')[0]) || 48,
	}))
}

function parseHTMLHead(html: string): ParsedHTML {
	const result: ParsedHTML = {
		manifest: '',
		icons: [
			{
				href: '/favicon.ico',
				size: 16,
				touch: false,
			},
		],
	}

	const document = new DOMParser().parseFromString(html, 'text/html')
	const head = document?.querySelector('head')

	if (head) {
		for (const elem of Object.values(head.children)) {
			if (elem.tagName.toLocaleLowerCase() !== 'link') {
				continue
			}

			const rel = elem.getAttribute('rel') ?? ''
			const href = elem.getAttribute('href') ?? ''
			const sizes = elem.getAttribute('sizes') ?? ''

			if (rel?.toLocaleLowerCase() === 'manifest') {
				result.manifest = href ?? ''
			}

			if (rel?.toLocaleLowerCase().includes('icon')) {
				result.icons.push({
					href,
					size: parseInt(sizes?.split('x')[0]) || 48,
					touch: !!rel?.toLocaleLowerCase().match(/apple-touch-icon|fluid-icon/g),
				})
			}
		}
	}

	return result
}

function createFullPath(url: string, query: string) {
	const { hostname, protocol, pathname } = new URL(query)

	if (!url) return ''

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
		const signal = AbortSignal.timeout(2500)
		const response = await fetch(url, { signal })

		if (response.status === 200) {
			return true
		}
	} catch (error) {
		console.warn(error)
	}

	return false
}

function response(body: string): Response {
	return new Response(body, {
		headers: {
			'access-control-allow-origin': '*',
		},
	})
}

export default async (request: Request) => {
	const url = new URL(request.url)
	const query = url?.pathname?.replace('/', '') ?? ''
	let html: string | null = null
	let res = ''

	// Is locahost
	if (query.startsWith('localhost') || query.startsWith('http://localhost')) {
		return response(localhost)
	}

	// Website is in list
	res = getURLFromWebsiteList(query)
	if (res?.length > 0) {
		return response(res)
	}

	// Fetch from website
	if (stringToURL(query)) {
		html = await getHTML(query)
	}

	if (html) {
		let { manifest, icons } = parseHTMLHead(html)

		// Is there a touch icon ?
		if (icons.some((ico) => ico.touch)) {
			icons = sortClosestToSize(icons)
			res = icons.filter((ico) => ico.touch)[0].href
			res = createFullPath(res, query)

			if (await isIconFetchable(res)) {
				return response(res)
			}
		}

		// Is manifest available ?
		else if (manifest.length > 0) {
			const path = createFullPath(manifest, query)
			const json = await getManifest(path)
			icons = icons.concat(parseManifest(json as Manifest))
		}

		icons = sortClosestToSize(icons)
		res = createFullPath(icons[0]?.href, query)

		// Validate icon url
		if (await isIconFetchable(res)) {
			return response(res)
		}
	}

	// Fallback
	const fallback = stringToURL(query)
	res = `${fallback?.protocol || 'http:'}//${fallback?.hostname}/favicon.ico`

	// Validate icon url
	if (await isIconFetchable(res)) {
		return response(res)
	}

	return response(isnotfound)
}
