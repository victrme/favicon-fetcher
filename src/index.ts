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

	if (['http://localhost', 'http://127.0.0.1'].some((path) => query.startsWith(path))) {
		return ['localhost']
	}

	//
	// Step 2: Is available from static list

	const urlFromList = getURLFromWebsiteList(query, websites)

	if (urlFromList) {
		return [urlFromList]
	}

	//
	// Step 3: Put and sort all potential icon paths in a list

	const icons: Icon[] = []
	const html = await fetchBody(query)

	if (html) {
		const head = parseHead(html)
		icons.push(...sortClosestToSize(head.icons, 144))

		if (head.manifest) {
			const path = fullpath(head.manifest, query)
			const manifest = await fetchManifest(path)

			if (manifest) {
				const manifestIcons = parseManifest(manifest)
				icons.push(...sortClosestToSize(manifestIcons, 144))
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
	// Step 4: Return list of href

	return icons.map((icon) => fullpath(icon.href, query))
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
	const endHeadTag = html.indexOf('</head>')

	if (endHeadTag > 0) {
		html = html.slice(0, endHeadTag)
	}

	if (html.indexOf('<script') > 0) {
		html = html
			.split('<script')
			.map((str) => str.slice(str.indexOf('</script>') + 9))
			.join()
	}

	const links = html.split('<link').map((str) => `<link ${str.slice(0, str.indexOf('>'))}>`)
	const metas = html.split('<meta').map((str) => `<meta ${str.slice(0, str.indexOf('>'))}>`)

	const sliceAttr = (str = '', from = '', to = '') => {
		const start = str.indexOf(from) + from.length
		const end = str.indexOf(to, start) + (to.length - 1)
		return str.substring(start, end)
	}

	for (const meta of metas) {
		const name = sliceAttr(meta, 'name="', '"').toLocaleLowerCase()
		const content = sliceAttr(meta, 'content="', '"')

		if (name.includes('apple-touch-icon')) {
			result.icons.push({ href: content, size: 100, touch: true })
		}
	}

	for (const link of links) {
		const rel = sliceAttr(link, 'rel="', '"').toLocaleLowerCase()
		const href = sliceAttr(link, 'href="', '"')
		const sizes = sliceAttr(link, 'sizes="', '"').toLocaleLowerCase()

		if (rel.includes('manifest')) {
			result.manifest = href
		}

		if (rel.includes('icon')) {
			result.icons.push({
				href,
				size: sizesToNumber(sizes),
				touch: rel.includes('apple-touch') || rel.includes('fluid') || rel.includes('mask'),
			})
		}
	}

	return result
}

//
// Helpers
//

function fullpath(url: string, query: string): string {
	if (!url) return ''

	let queryURL: URL

	try {
		queryURL = new URL(query)
	} catch (_) {
		return '' // ... error handling ?
	}

	const { hostname, protocol, pathname } = queryURL

	if (url.startsWith('http')) {
		return url
	}

	// It means (https:)//
	if (url.startsWith('//')) {
		return `${protocol}${url}`
	}

	// If icon from root, only add protocol & hostname
	// Absolute path, also gets pathname
	return `${protocol}//${hostname}${url.startsWith('/') ? '' : pathname}${url}`
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

export function dataUriToBlob(uri: string): Blob {
	const plain = atob(uri.replace('data:image/svg+xml;base64,', ''))
	const blob = new Blob([plain], { type: 'image/svg+xml' })

	return blob
}
