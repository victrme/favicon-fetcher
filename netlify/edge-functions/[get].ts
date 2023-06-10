import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'
import { isnotfound, localhost } from '../../assets/icons.ts'
import websites from '../../assets/websites.ts'

type Icon = {
	href: string
	size: number
	touch?: boolean
}

type ParsedHTML = {
	manifest: string
	icons: Icon[]
}

type Manifest = {
	icons?: {
		src: string
		sizes: string
	}[]
}

export default async (request: Request) => {
	const query = (stringToURL(request.url)?.pathname ?? '')?.replace('/', '')
	const icons: Icon[] = []
	let manifestPath = ''

	if (query === '') {
		return response('')
	}

	if (query.startsWith('localhost') || query.startsWith('http://localhost')) {
		return response(localhost)
	}

	if (getURLFromWebsiteList(query)) {
		return response(getURLFromWebsiteList(query))
	}

	const html = await getHTML(query)
	const parsed = parseHTMLHead(html)

	icons.push(...parsed.icons)
	manifestPath = parsed.manifest

	if (manifestPath.length > 0) {
		const path = createFullPath(manifestPath, query)
		const json = parseManifest(await getManifest(path))
		icons.push(...json)
	}

	if (icons.length === 0) {
		icons.push({
			href: `/favicon.ico`,
			size: -1024,
			touch: false,
		})
	}

	console.log(sortClosestToSize(icons))

	for (const icon of sortClosestToSize(icons)) {
		const path = createFullPath(icon.href, query)
		if (await isIconFetchable(path)) {
			return response(path)
		}
	}

	return response(isnotfound)
}

function response(body: string, status = 200): Response {
	return new Response(body, {
		status,
		headers: {
			'access-control-allow-origin': '*',
			'cache-control': 'public, maxage=3600',
		},
	})
}

const fetchHeaders = {
	'Cache-Control': 'max-age=0',
	'Accept-Language': 'en-US;q=0.9,en;q=0.7',
	'Sec-Ch-Ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
	'Sec-Ch-Ua-Mobile': '?0',
	'Sec-Ch-Ua-Platform': '"macOS"',
	'Sec-Fetch-Dest': 'document',
	'Sec-Fetch-Site': 'none',
	'Sec-Fetch-User': '?1',
	'User-Agent':
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
}

function stringToURL(str: string) {
	try {
		return new URL(str)
	} catch (_) {
		console.warn("Can't parse to URL")
	}
}

function sortClosestToSize(icons: Icon[], val = 144) {
	const sorted = icons.sort((a, b) => Math.abs(a.size - val) - Math.abs(b.size - val))
	return sorted
}

function getURLFromWebsiteList(query: string) {
	for (const { domain, url } of websites) {
		if (query.includes(domain)) {
			return url
		}
	}

	return ''
}

async function getHTML(url: string): Promise<string> {
	try {
		const signal = AbortSignal.timeout(6000)
		const response = await fetch(url, {
			headers: fetchHeaders,
			signal,
		})

		if (response.status === 200) {
			const html = await response.text()
			return html
		}
	} catch (_) {
		console.warn("Can't get HTML")
	}

	return ''
}

async function getManifest(path: string): Promise<Manifest> {
	try {
		const manifest = await fetch(path, { headers: fetchHeaders })
		const json = await manifest.json()
		return json
	} catch (_error) {
		console.warn("Can't get manifest: " + path)
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
	const result: ParsedHTML = { manifest: '', icons: [] }
	const closingHeadPos = html.indexOf('</head>')

	if (closingHeadPos > 0) {
		html = html.slice(0, closingHeadPos)
	}

	const document = new DOMParser().parseFromString(html, 'text/html')
	const head = document?.querySelector('head')

	for (const elem of Object.values(head?.children ?? [])) {
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

async function isIconFetchable(url: string): Promise<boolean> {
	if (!stringToURL(url)) {
		return false
	}

	try {
		console.time('ICON')
		const signal = AbortSignal.timeout(2500)
		const response = await fetch(url, { signal, headers: fetchHeaders })

		if (response.status === 200) {
			console.timeEnd('ICON')
			return true
		}
	} catch (_) {
		console.warn("Can't fetch icon")
	}

	return false
}
