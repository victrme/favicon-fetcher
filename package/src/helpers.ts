import STATIC_ICONS from "./icons"
import { toLog } from "./index"
import type { Icon } from "./parsers"

export function fullpath(url: string, query: string): string {
	if (url.startsWith("data:image/")) {
		return url
	}

	try {
		new URL(query)
	} catch (_error) {
		toLog(query, url, "Cannot create a valid URL")
		return ""
	}

	const { protocol, origin, pathname } = new URL(query)

	if (url.startsWith("http")) {
		return url
	}

	// It means (https:)//
	if (url.startsWith("//")) {
		return `${protocol}${url}`
	}

	// Relative path and not at root
	if (!url.startsWith("/") && pathname !== "/") {
		return `${origin}${pathname}${url}`
	}

	return `${origin}${url}`
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
