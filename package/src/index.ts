import { getDebug, getIconFromList, initDebug, initLog, sortClosestToSize, toDebug, toLog } from "./helpers"
import { fetchHtml, fetchIcon, fetchManifest } from "./fetchers"
import { parseHead, parseManifest } from "./parsers"
import STATIC_ICONS from "./icons"

import type { Icon } from "./parsers"
import type { Debug } from "./helpers"

interface MainOptions {
	log?: true
	check?: "all" | "best" | "none"
}

interface FaviconList {
	found: string[]
	fallbacks: string[]
	notfound: string
}

/**
 * Find the best favicon for the specified query.
 *
 * @param text - Receive a favicon as a string URL
 * @param blob - Receive a favicon as a blob (image)
 * @param fetch - Accepts a Request with /:type/:url as path
 * @param debug - Returns a JSON of all data collected by favicon fetcher
 * @param list - Get all favicon URL found for the specified query
 *
 * @example
 * import favicon from "@victr/favicon-fetcher"
 * await favicon.text("...")
 *
 * @example
 * import { faviconAsText } from "@victr/favicon-fetcher"
 * await faviconAsText("...")
 */
export default {
	text: faviconAsText,
	blob: faviconAsBlob,
	fetch: faviconAsFetch,
	debug: debugFavicon,
	list: listAvailableFavicons,
}

/**
 * Specify a website, receive a favicon as a string URL
 *
 * @param query - Must add protocol in order to work (http:// or https://)
 * @param options
 * @param options.log - Adds console errors
 * @param options.check - Either check validity for all found icons, best found icon, or none
 * @returns A favicon URL found for the query specified
 */
export async function faviconAsText(query: string, options?: MainOptions): Promise<string> {
	return await main(query, "text", options ?? { check: "best" })
}

/**
 * Specify a website, receive a favicon as a blob (image)
 *
 * @param query - Must add protocol in order to work (http:// or https://)
 * @param options
 * @param options.log - Adds console errors
 * @param options.check - Either check validity for all found icons, best found icon, or none
 * @returns A favicon found for the query specified
 */
export async function faviconAsBlob(query: string, options?: MainOptions): Promise<Blob> {
	return await main(query, "blob", options ?? { check: "best" })
}

/**
 * Specify a website, receive a list of favicon URLs
 *
 * @param query - Must add protocol in order to work (http:// or https://)
 * @returns All favicon URL found for the query specified
 */
export async function listAvailableFavicons(query: string): Promise<string[]> {
	const list = await createFaviconList(query)
	return [...list.found, ...list.fallbacks, list.notfound]
}

/**
 * Similar to list, it logs all steps favicon fetcher retrieved or parsed data
 *
 * @param query - Must add protocol in order to work (http:// or https://)
 * @returns A collection of data parsed by favicon fetcher
 */
export async function debugFavicon(query: string): Promise<Debug> {
	initDebug()
	await main(query, "text", { check: "none" })
	return getDebug()
}

/**
 * Request a favicon using the fetch syntax.
 *
 * @param request A GET request with the return type and query as its pathname
 * @returns A response with a 30 days cache control
 * @example
 * // Get wikipedia's favicon as text
 * const url = "http://example.com/text/https://wikipedia.org"
 * const resp = await favicon.fetch(url)
 * const src = await resp.text()
 */
export async function faviconAsFetch(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const headers = new Headers({
		"Content-Type": "text/plain",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET",
		"Cache-Control": "public, max-age=604800, immutable",
	})

	let query: string = ""
	let type: string = ""

	if (url.pathname.includes("/blob/")) type = "blob"
	if (url.pathname.includes("/text/")) type = "text"
	if (url.pathname.includes("/list/")) type = "list"
	if (url.pathname.includes("/debug/")) type = "debug"

	query = url.pathname.slice(url.pathname.indexOf(`/${type}/`) + type.length + 2)

	switch (type) {
		case "text": {
			const text = await faviconAsText(query)
			return new Response(text, { headers })
		}

		case "blob": {
			const blob = await faviconAsBlob(query)
			headers.set("Content-Type", blob.type)
			return new Response(blob, { headers })
		}

		case "list": {
			const list = await listAvailableFavicons(query)
			headers.set("Content-Type", "application/json")
			return new Response(JSON.stringify(list), { headers })
		}

		case "debug": {
			const debug = await debugFavicon(query)
			headers.set("Content-Type", "application/json")
			return new Response(JSON.stringify(debug), { headers })
		}

		case "": {
			return new Response('Type must be "blob", "text", "list", or "debug"', {
				status: 404,
			})
		}

		default: {
			return new Response("Undefined error", {
				status: 500,
			})
		}
	}
}

//
//
//

async function main(query: string, as: "blob", options: MainOptions): Promise<Blob>
async function main(query: string, as: "text", options: MainOptions): Promise<string>
async function main(query: string, as: "blob" | "text", options: MainOptions) {
	initLog(!!options.log)

	const list = await createFaviconList(query)
	const isNone = options.check === "none"
	const isBest = options.check === "best"
	const isAll = options.check === "all"

	// No check

	if (isNone) {
		if (as === "text") {
			return list.found[0]
		}

		if (as === "blob") {
			const blob = await fetchIcon(list.found[0])
			return blob ? blob : await fetchIcon(list.notfound)
		}
	}

	// Checks and fallbacks

	const found = isBest ? [list.found[0]] : isAll ? list.found : []
	const urls = found.concat(list.fallbacks, list.notfound)

	for (const url of urls) {
		const blob = await fetchIcon(url)

		if (blob?.type.includes("image")) {
			if (as === "text") return url
			if (as === "blob") return blob
		}
	}

	// Nothing found

	throw new Error("No valid icon found in list")
}

async function createFaviconList(query: string): Promise<FaviconList> {
	const result: FaviconList = {
		found: [],
		fallbacks: [],
		notfound: `${STATIC_ICONS.HOST}notfound.svg`,
	}

	// Step 1: Return not found with bad query

	try {
		new URL(query)
	} catch (_) {
		toLog(query, "Query is invalid")
		return result
	}

	// Step 2: Is available from static list

	const staticIconUrl = getIconFromList(query)

	if (staticIconUrl) {
		result.found = [`${STATIC_ICONS.HOST}${staticIconUrl}`]
		return result
	}

	// Step 3: Put and sort all potential icon paths in a list

	const icons: Icon[] = []
	const { html, redirected } = await fetchHtml(query)

	if (redirected) {
		query = redirected
	}

	if (html) {
		const head = parseHead(html)
		icons.push(...sortClosestToSize(head.icons, 144))

		if (head.manifest) {
			const path = generateFullPath(head.manifest, query)
			const manifest = await fetchManifest(path[0])

			if (manifest) {
				const manifestIcons = parseManifest(manifest)
				icons.push(...sortClosestToSize(manifestIcons, 144))
			}
		}
	}

	// 3. bis. Add fallbacks

	const { host, origin } = new URL(query)
	const faviconico = `https://${host}/favicon.ico`
	const duckduckgo = `https://www.google.com/s2/favicons?domain=${origin}&sz=128`

	result.fallbacks.push(duckduckgo)
	result.fallbacks.push(faviconico)

	// Step 4: Add list of href

	for (const icon of icons) {
		result.found = result.found.concat(generateFullPath(icon.href, query))
	}

	// Step 5: Return

	toDebug("paths", result)

	return result
}

function generateFullPath(href: string, query: string): string[] {
	// a. Check for always valid paths

	if (href.startsWith("data:image/")) {
		return [href]
	}

	if (href.startsWith("http")) {
		return [href]
	}

	if (href.startsWith("//")) {
		return [`https:${href}`]
	}

	// b. Query sanitation

	try {
		new URL(query)
	} catch (_error) {
		toLog(query, href, "Cannot create a valid URL")
		return []
	}

	const url = new URL(query)
	let pathname = url.pathname

	if (pathname.endsWith("/")) {
		pathname = pathname.slice(0, pathname.length - 2)
	}

	// c. Return root and/or relative paths

	if (href.startsWith("/")) {
		return [`${url.origin}${href}`]
	}

	return [`${url.origin}/${href}`, `${url.origin}${pathname}/${href}`]
}
