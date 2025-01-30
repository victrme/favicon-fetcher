import { log } from "./helpers.ts"

interface fetchHtmlResponse {
	html: string
	redirected?: string
}

export interface Manifest {
	icons?: {
		src: string
		sizes: string
	}[]
}

const headers: HeadersInit = {
	"Cache-Control": "max-age=0",
	"Accept-Language": "en-US;q=0.9,en;q=0.7",
	"Sec-Ch-Ua": '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
	"Sec-Ch-Ua-Mobile": "?0",
	"Sec-Ch-Ua-Platform": '"macOS"',
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Site": "none",
	"Sec-Fetch-User": "?1",
	"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
}

export async function fetchHtml(url: string): Promise<fetchHtmlResponse> {
	const signal = AbortSignal.timeout(6000)
	const resp = await fetch(url, { headers, signal })
	const html = await resp.text()

	if (resp.redirected) {
		return { html, redirected: resp.url }
	}

	return { html }
}

export async function fetchManifest(url: string): Promise<Manifest | undefined> {
	try {
		const signal = AbortSignal.timeout(2000)
		const resp = await fetch(url, { headers, signal })
		const json = await resp.json()
		return json
	} catch (_error) {
		if (log.item.ERRORS) {
			console.error(url, "Can't fetch manifest")
		}
	}
}

export async function fetchIcon(url: string): Promise<Blob | undefined> {
	try {
		const signal = AbortSignal.timeout(2500)
		const resp = await fetch(url, { signal, headers })

		if (resp.status === 200) {
			const blob = await resp.blob()
			return blob
		}
	} catch (_error) {
		if (log.item.ERRORS) {
			console.error(url, "Can't fetch favicon")
		}
	}
}
