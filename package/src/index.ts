import { fullpath, getIconFromList, sortClosestToSize } from './helpers'
import { fetchIcon, fetchBody, fetchManifest } from './fetchers'
import { Icon, parseHead, parseManifest } from './parsers'
import STATIC_ICONS from './icons'

export default {
	text: faviconAsText,
	blob: faviconAsBlob,
	fetch: faviconAsFetch,
}

/**
 * @param query - Must add protocol in order to work (http:// or https://)
 * @param fast - Fast mode does not check if found URL is valid.
 * @returns
 */
async function faviconAsText(query: string, fast?: true) {
	return await main(query, !!fast, 'text')
}

/**
 * @param query - Must add protocol in order to work (http:// or https://)
 * @param fast - Fast mode only load first favicon found
 * @returns
 */
async function faviconAsBlob(query: string, fast?: true) {
	return await main(query, !!fast, 'blob')
}

/**
 * @param request A GET request with the return type and query as its pathname
 * @returns A response with a 30 days cache control
 * @example // Get wikipedia's favicon as text
 * const url = "http://example.com/text/https://wikipedia.org"
 * const resp = await favicon.fetch(url)
 * const src = await resp.text()
 */
async function faviconAsFetch(request: Request): Promise<Response> {
	const headers = new Headers({
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET',
		'Access-Control-Max-Age': 'public, max-age=604800, immutable',
	})

	const url = new URL(request.url ?? '')
	const path = url.pathname
	const endpoint = path.slice(0, path.indexOf('http'))
	const type = endpoint.includes('/blob') ? 'blob' : 'text'
	const query = path.slice(Math.max(0, path.indexOf('http')))

	let result: unknown = undefined

	if (type === 'blob') {
		const blob = await main(query, false, 'blob')
		headers.set('Content-Type', blob.type)
		result = blob
	}

	if (type === 'text') {
		result = await main(query, false, 'blob')
	}

	return new Response(undefined, { status: 400, headers })
}

//
//
//

async function main(query: string, fast: boolean, as: 'blob'): Promise<Blob>
async function main(query: string, fast: boolean, as: 'text'): Promise<string>
async function main(query: string, fast: boolean, as: 'blob' | 'text') {
	const found = await createFaviconList(query)
	const hasOneIcon = found.length === 1
	const useFastMode = found.length > 0 && fast

	if (hasOneIcon || useFastMode) {
		if (as === 'text') {
			return found[0]
		}

		if (as === 'blob') {
			const blob = await fetchIcon(found[0])

			if (blob) {
				return blob
			}

			if (useFastMode) {
				throw new Error('Fast mode. Could not find valid favicon')
			}
		}

		throw new Error('Static icon could not load. Wrong host url ?')
	}

	for (const url of found) {
		const blob = await fetchIcon(url)

		if (blob?.type.includes('image')) {
			if (as === 'text') return url
			if (as === 'blob') return blob
		}
	}

	throw new Error('No valid icon found in list')
}

async function createFaviconList(query: string): Promise<string[]> {
	// Step 1: Return not found when empty

	if (query === '') {
		return [`${STATIC_ICONS.HOST}notfound.svg`]
	}

	// Step 2: Is available from static list

	const staticIconUrl = getIconFromList(query)

	if (staticIconUrl) {
		return [`${STATIC_ICONS.HOST}${staticIconUrl}`]
	}

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
		icons.push(
			{
				href: `/favicon.ico`,
				size: -1024,
				touch: false,
			},
			{
				href: `${STATIC_ICONS.HOST}notfound.svg`,
				size: -2048,
				touch: false,
			}
		)
	}

	// Step 4: Return list of href

	return icons.map((icon) => fullpath(icon.href, query))
}

// const target = addMissingProtocolSlash(path.slice(Math.max(0, path.indexOf('http'))))

// function addMissingProtocolSlash(url: string) {
// 	const missingSlashRegex = /(https?:\/)(?!\/)([^\/]*)/
// 	return url.replace(missingSlashRegex, (_, protocol, rest) => `${protocol}/${rest}`)
// }
