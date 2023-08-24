type Assets = {
	notfound: string
	localhost: string
	websites: {
		domain: string
		url: string
	}[]
}

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

export default async (query: string, assets: Assets): Promise<string> => {
	const { notfound, localhost, websites } = assets
	const icons: Icon[] = []
	let manifestPath = ''

	try {
		query = new URL(query).pathname.replace('/', '')
		query = query.startsWith('get/') ? query.replace('get/', '') : query
	} catch (_) {
		console.log('Not valid query')
	}

	if (query === '') {
		return ''
	}

	if (query.startsWith('localhost') || query.startsWith('http://localhost')) {
		return localhost
	}

	console.log(query)

	try {
		new URL(query)
	} catch (_) {
		return notfound
	}

	const iconFromList = getURLFromWebsiteList(query, websites)
	if (iconFromList) {
		return iconFromList
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

	for (const icon of sortClosestToSize(icons)) {
		// removes queries to avoid cache busting URLs
		if (icon.href.indexOf('?') > 0) {
			icon.href = icon.href.slice(0, icon.href.indexOf('?'))
		}

		const path = createFullPath(icon.href, query)

		if (await isIconFetchable(path)) {
			return path
		}
	}

	return notfound
}

function stringToURL(str: string) {
	try {
		return new URL(str)
	} catch (_) {
		console.warn("Can't parse to URL")
	}
}

function sortClosestToSize(icons: Icon[], val = 144): Icon[] {
	const sorted = icons.sort((a, b) => Math.abs(a.size - val) - Math.abs(b.size - val))
	return sorted
}

function sizesToNumber(str = ''): number {
	return parseInt(str?.split('x')[0]) || 48
}

function getURLFromWebsiteList(query: string, websites: Assets['websites']): string {
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
		console.warn("Can't get HTML: " + url)
	}

	return ''
}

async function getManifest(url: string): Promise<Manifest> {
	try {
		const manifest = await fetch(url, { headers: fetchHeaders })
		const json = await manifest.json()
		return json
	} catch (_) {
		console.warn("Can't get manifest: " + url)
		return {}
	}
}

function parseManifest(json: Manifest): Icon[] {
	if (!json?.icons) return []

	return json.icons.map((ico) => ({
		href: ico.src,
		size: sizesToNumber(ico.sizes),
	}))
}

function parseHTMLHead(html: string): ParsedHTML {
	const result: ParsedHTML = { manifest: '', icons: [] }
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
		const signal = AbortSignal.timeout(2500)
		const response = await fetch(url, { signal, headers: fetchHeaders })

		if (response.status === 200) {
			return true
		}
	} catch (_) {
		console.warn("Can't fetch icon" + url)
	}

	return false
}
