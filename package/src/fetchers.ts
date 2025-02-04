import { toDebug, toLog } from "./helpers"

interface fetchHtmlResponse {
	html?: string
	redirected?: string
	captchaProtected?: true
}

export interface Manifest {
	icons?: {
		src: string
		sizes: string
	}[]
}

const turnstileTitle = "<title>Just a moment...</title>"

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
	const result: fetchHtmlResponse = {}

	try {
		const signal = AbortSignal.timeout(6000)
		const resp = await fetch(url, { headers, signal })
		const html = await resp.text()

		result.html = html

		const isCaptcha = html.includes(turnstileTitle)
		const isRedirect = resp.redirected

		if (isCaptcha) {
			toDebug("html", html)
			return { captchaProtected: true }
		}

		if (isRedirect) {
			result.redirected = resp.url
		}
	} catch (_) {
		toLog(url, "Can't fetch HTML")
	}

	return result
}

export async function fetchManifest(url: string): Promise<Manifest | undefined> {
	try {
		const signal = AbortSignal.timeout(2000)
		const resp = await fetch(url, { headers, signal })
		const json = await resp.json()
		return json
	} catch (_) {
		toLog(url, "Can't fetch manifest")
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
	} catch (_) {
		toLog(url, "Can't fetch favicon")
	}
}
