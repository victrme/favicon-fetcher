import { sizesToNumber } from "./helpers"
import { Manifest } from "./fetchers"

export interface Icon {
	href: string
	size: number
	touch?: boolean
}

export interface Head {
	manifest?: string
	icons: Icon[]
}

export function parseManifest({ icons }: Manifest): Icon[] {
	if (icons) {
		return icons.map((icon) => ({
			href: icon.src,
			size: sizesToNumber(icon.sizes),
		}))
	}

	return []
}

export function parseHead(html: string): Head {
	const result: Head = { icons: [] }
	const endHeadTag = html.indexOf("</head>")

	if (endHeadTag > 0) {
		html = html.slice(0, endHeadTag)
	}

	if (html.indexOf("<script") > 0) {
		html = html
			.split("<script")
			.map((str) => str.slice(str.indexOf("</script>") + 9))
			.join()
	}

	const links = html.split("<link").map((str) => `<link ${str.slice(0, str.indexOf(">"))}>`)
	const metas = html.split("<meta").map((str) => `<meta ${str.slice(0, str.indexOf(">"))}>`)

	const sliceAttr = (str = "", from = "", to = "") => {
		const start = str.indexOf(from) + from.length
		const end = str.indexOf(to, start) + (to.length - 1)
		return str.substring(start, end)
	}

	for (const meta of metas) {
		const name = sliceAttr(meta, 'name="', '"').toLocaleLowerCase()
		const content = sliceAttr(meta, 'content="', '"')

		if (name.includes("apple-touch-icon")) {
			result.icons.push({ href: content, size: 100, touch: true })
		}
	}

	for (const link of links) {
		const rel = sliceAttr(link, 'rel="', '"').toLocaleLowerCase()
		const href = sliceAttr(link, 'href="', '"')
		const sizes = sliceAttr(link, 'sizes="', '"').toLocaleLowerCase()

		if (rel.includes("manifest")) {
			result.manifest = href
		}

		if (rel.includes("icon")) {
			result.icons.push({
				href,
				size: sizesToNumber(sizes),
				touch: rel.includes("apple-touch") || rel.includes("fluid") || rel.includes("mask"),
			})
		}
	}

	return result
}
