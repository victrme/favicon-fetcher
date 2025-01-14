import STATIC_ICONS from "./icons"
import { Icon } from "./parsers"

export function fullpath(url: string, query: string): string {
	if (!url) return ""

	let queryURL: URL

	try {
		queryURL = new URL(query)
	} catch (_) {
		return "" // ... error handling ?
	}

	const { hostname, protocol, pathname } = queryURL

	if (url.startsWith("http")) {
		return url
	}

	// It means (https:)//
	if (url.startsWith("//")) {
		return `${protocol}${url}`
	}

	// If icon from root, only add protocol & hostname
	// Absolute path, also gets pathname
	return `${protocol}//${hostname}${url.startsWith("/") ? "" : pathname}${url}`
}

export function sortClosestToSize(icons: Icon[], val: number): Icon[] {
	const sorted = icons.sort((a, b) => Math.abs(a.size - val) - Math.abs(b.size - val))
	return sorted
}

export function sizesToNumber(str = ""): number {
	return parseInt(str?.split("x")[0]) || 48
}

export function getIconFromList(query: string): string | undefined {
	const iconList = Object.entries(STATIC_ICONS.LIST)

	for (const [path, matches] of iconList) {
		for (const match of matches) {
			if (query.includes(match)) return path
		}
	}
}
