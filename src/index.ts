import { notfound, localhost } from './assets/icons'
import { websites, Websites } from './assets/websites'

type Icon = {
	href: string
	size: number
	touch?: boolean
}

type Head = {
	manifest?: string
	icons: Icon[]
}

type Manifest = {
	icons?: {
		src: string
		sizes: string
	}[]
}

export default {
	url: handlerAsText,
	img: handlerAsBlob,
}

async function handlerAsText(query: string): Promise<string> {
	for (const path of await foundIconUrls(query)) {
		//
		if (path === 'localhost') {
			return localhost
		}

		const result = await fetchIcon(path)

		if (result) {
			return path
		}
	}

	return notfound
}

async function handlerAsBlob(query: string): Promise<Blob> {
	for (const path of await foundIconUrls(query)) {
		//
		if (path === 'localhost') {
			return dataUriToBlob(localhost)
		}

		const blob = await fetchIcon(path)

		if (blob && blob.type.includes('image')) {
			return blob
		}
	}

	return dataUriToBlob(notfound)
}

async function foundIconUrls(query: string): Promise<string[]> {
	if (query === '') {
		return []
	}

	//
	// Step 1: Is localhost

	const localPaths = ['localhost', 'http://localhost', '127.0.0.1', 'http://127.0.0.1']
	const isLocalhost = localPaths.some((path) => query.startsWith(path))

	if (isLocalhost) {
		return ['localhost']
	}

	//
	// Step 2: Is available from static list

	const urlFromList = getURLFromWebsiteList(query, websites)

	if (urlFromList) {
		return [urlFromList]
	}

	//
	// Step 3: Put all potential icon paths in a list

	const icons: Icon[] = []
	const html = await fetchBody(query)

	if (html) {
		const head = parseHead(html)
		icons.push(...head.icons)

		if (head.manifest) {
			const path = fullpath(head.manifest, query)
			const manifest = await fetchManifest(path)

			if (manifest) {
				const json = parseManifest(manifest)
				icons.push(...json)
			}
		}
	}

	if (icons.length === 0) {
		icons.push({
			href: `/favicon.ico`,
			size: -1024,
			touch: false,
		})
	}

	//
	// Step 4: Return sorted icons around specific size

	return sortClosestToSize(icons, 144).map(({ href }) => fullpath(href, query))
}

//
// Fetchers
//

const headers: HeadersInit = {
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

async function fetchBody(url: string): Promise<string | undefined> {
	try {
		const signal = AbortSignal.timeout(6000)
		const resp = await fetch(url, { headers, signal })
		const text = await resp.text()
		return text
	} catch (_) {
		console.warn("Can't fetch HTML: " + url)
	}
}

async function fetchManifest(url: string): Promise<Manifest | undefined> {
	try {
		const signal = AbortSignal.timeout(2000)
		const resp = await fetch(url, { headers, signal })
		const json = await resp.json()
		return json
	} catch (_) {
		console.warn("Can't fetch manifest: " + url)
	}
}

async function fetchIcon(url: string): Promise<Blob | undefined> {
	try {
		const signal = AbortSignal.timeout(2500)
		const resp = await fetch(url, { signal, headers })

		if (resp.status === 200) {
			const blob = await resp.blob()
			return blob
		}
	} catch (_) {
		console.warn("Can't fetch icon: " + url)
	}
}

//
// Parsers
//

function parseManifest({ icons }: Manifest): Icon[] {
	if (icons) {
		return icons.map((icon) => ({
			href: icon.src,
			size: sizesToNumber(icon.sizes),
		}))
	}

	return []
}

function parseHead(html: string): Head {
	const result: Head = { icons: [] }
	const closingHeadPos = html.indexOf('</head>')

	if (closingHeadPos > 0) {
		html = html.slice(0, closingHeadPos)
	}

	const linktags: string[] = []
	let start = html.indexOf('<link')

	while (start !== -1) {
		const end = html.indexOf('>', start) + 1
		linktags.push(html.substring(start, end))
		start = html.indexOf('<link', end)
	}

	const sliceAttr = (str = '', from = '', to = '') => {
		const start = str.indexOf(from) + from.length
		const end = str.indexOf(to, start) + (to.length - 1)
		return str.substring(start, end)
	}

	for (const link of linktags) {
		const rel = sliceAttr(link, 'rel="', '"').toLocaleLowerCase()
		const href = sliceAttr(link, 'href="', '"').toLocaleLowerCase()
		const sizes = sliceAttr(link, 'sizes="', '"').toLocaleLowerCase()

		if (rel.includes('manifest')) {
			result.manifest = href
		}

		if (rel.includes('icon')) {
			result.icons.push({
				href,
				size: sizesToNumber(sizes),
				touch: rel.includes('apple-touch') || rel.includes('fluid'),
			})
		}
	}

	return result
}

//
// Helpers
//

function fullpath(url: string, query: string): string {
	try {
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
	} catch (_) {
		// ... error handling ?
	}

	return url
}

function sortClosestToSize(icons: Icon[], val: number): Icon[] {
	const sorted = icons.sort((a, b) => Math.abs(a.size - val) - Math.abs(b.size - val))
	return sorted
}

function sizesToNumber(str = ''): number {
	return parseInt(str?.split('x')[0]) || 48
}

function getURLFromWebsiteList(query: string, websites: Websites): string | undefined {
	for (const { domain, url } of websites) {
		if (typeof domain === 'string') {
			if (query.includes(domain)) return url
		}

		if (typeof domain === 'object') {
			for (const item of domain) {
				if (query.includes(item)) return url
			}
		}
	}
}

function dataUriToBlob(uri: string): Blob {
	const plain = atob(uri.replace('data:image/svg+xml;base64,', ''))
	const blob = new Blob([plain], { type: 'image/svg+xml' })

	return blob
}
