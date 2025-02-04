import { fullpath, getDebug, getIconFromList, initDebug, initLog, sortClosestToSize, toDebug, toLog } from "./helpers"
import { fetchHtml, fetchIcon, fetchManifest } from "./fetchers"
import { parseHead, parseManifest } from "./parsers"
import STATIC_ICONS from "./icons"

import type { Icon } from "./parsers"
import type { Debug } from "./helpers"

interface MainOptions {
	log?: true
	fast?: true
	debug?: true
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
 * @param fast - Fast mode does not check if found URL is valid.
 * @returns A favicon URL found for the query specified
 */
export async function faviconAsText(query: string, fast?: true): Promise<string> {
	return await main(query, "text", { fast })
}

/**
 * Specify a website, receive a favicon as a blob (image)
 *
 * @param query - Must add protocol in order to work (http:// or https://)
 * @param fast - Fast mode only load first favicon found
 * @returns A favicon found for the query specified
 */
export async function faviconAsBlob(query: string, fast?: true): Promise<Blob> {
	return await main(query, "blob", { fast })
}

/**
 * Specify a website, receive a list of favicon URLs
 *
 * @param query - Must add protocol in order to work (http:// or https://)
 * @returns All favicon URL found for the query specified
 */
export async function listAvailableFavicons(query: string): Promise<string[]> {
	const list = await createFaviconList(query)
	return list
}

/**
 * Similar to list, it logs all steps favicon fetcher retrieved or parsed data
 *
 * @param query - Must add protocol in order to work (http:// or https://)
 * @returns A collection of data parsed by favicon fetcher
 */
export async function debugFavicon(query: string): Promise<Debug> {
	await main(query, "text", { debug: true, fast: true })
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
	initDebug(!!options.debug)

	const found = await createFaviconList(query)
	const hasOneIcon = found.length === 1
	const useFastMode = found.length > 0 && options.fast

	if (hasOneIcon || useFastMode) {
		if (as === "text") {
			return found[0]
		}

		if (as === "blob") {
			const blob = await fetchIcon(found[0])

			if (blob) {
				return blob
			}

			if (useFastMode) {
				throw new Error("Fast mode. Could not find valid favicon")
			}
		}
	}

	for (const url of found) {
		const blob = await fetchIcon(url)

		if (blob?.type.includes("image")) {
			if (as === "text") return url
			if (as === "blob") return blob
		}
	}

	throw new Error("No valid icon found in list")
}

async function createFaviconList(query: string): Promise<string[]> {
	// Step 1: Return not found with bad query

	try {
		new URL(query)
	} catch (_) {
		toLog(query, "Query is invalid")
		return [`${STATIC_ICONS.HOST}notfound.svg`]
	}

	// Step 2: Is available from static list

	const staticIconUrl = getIconFromList(query)

	if (staticIconUrl) {
		return [`${STATIC_ICONS.HOST}${staticIconUrl}`]
	}

	// Step 3: Put and sort all potential icon paths in a list

	const icons: Icon[] = []
	const { html, redirected, captchaProtected } = await fetchHtml(query)

	if (redirected) {
		query = redirected
	}

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
		const notfound = `${STATIC_ICONS.HOST}notfound.svg`
		icons.push({ href: notfound, size: -2048 })
	}

	if (captchaProtected) {
		const host = new URL(query).host
		const ddg = `https://icons.duckduckgo.com/ip3/${host}.ico`
		icons.push({ href: ddg, size: 64 })
	}

	// Step 4: Return list of href

	const fullpathIcons = icons.map((icon) => fullpath(icon.href, query))

	toDebug("paths", fullpathIcons)

	return fullpathIcons
}
