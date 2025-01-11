import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from 'vitest'
import { unstable_dev, UnstableDevWorker } from 'wrangler'
import { dataUriToBlob } from './index'
import STATIC_ICONS from '../icons'

let worker: UnstableDevWorker

const LOCALHOST = `${STATIC_ICONS.HOST}localhost.svg`
const NOTFOUND = `${STATIC_ICONS.HOST}notfound.svg`

beforeAll(async () => {
	worker = await unstable_dev('./cloudflare/index.ts', {
		ip: '127.0.0.1',
		experimental: { disableExperimentalWarning: true },
	})
})

afterAll(async () => {
	await worker.stop()
})

describe('Cloudflare worker', () => {
	it('is not returning server error status code', async () => {
		const resp = await worker.fetch('/')
		expect(resp.status < 500).toBe(true)
	})
})

describe.todo('Static icons', function () {
	it('are both SVG data URIs', function () {
		expect(NOTFOUND.startsWith('data:image/svg+xml;base64,')).toBe(true)
		expect(NOTFOUND.startsWith('data:image/svg+xml;base64,')).toBe(true)
	})

	it('can be converted to Blobs', function () {
		expect(dataUriToBlob(LOCALHOST)?.type).toBe('image/svg+xml')
		expect(dataUriToBlob(NOTFOUND)?.type).toBe('image/svg+xml')
	})
})

describe.todo('Website list', function () {
	// it('is of valid type', function () {
	// 	expectTypeOf(websites).toBeArray()
	// 	expectTypeOf(websites[0]).toBeObject()
	// 	expectTypeOf(websites[0].url).toBeString()
	// 	expect(Array.isArray(websites[0].domain) || typeof websites[0].domain === 'string').toBe(true)
	// })
	// it('has more than 1 domain when type is array', function () {
	// 	if (Array.isArray(websites[0].domain)) {
	// 		expect(websites[0].domain.length).toBeGreaterThan(1)
	// 	}
	// })
})

describe('Fetching', function () {
	it('returns notfound icon on empty query', async function () {
		const response = await worker.fetch('')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(NOTFOUND)
	})

	it('returns notfound icon on bad query', async function () {
		const response = await worker.fetch('/text/drgrdrdhwrdehrwjherwjh')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(NOTFOUND)
	})

	it('returns notfound icon when no protocols are specified', async function () {
		const response = await worker.fetch('/text/victr.me/')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(NOTFOUND)
	})

	it('gets favicon as text when no type specified', async function () {
		const response = await worker.fetch('/https://victr.me')
		expect(response.status).toBe(200)
		expect(await response.text()).toContain('https://')
	})

	it('gets favicon as text with old /get/ path', async function () {
		const response = await worker.fetch('/get/https://victr.me')
		expect(response.status).toBe(200)
		expect(await response.text()).toContain('https://')
	})

	it('gets favicon as text', async function () {
		const response = await worker.fetch('/text/https://victr.me')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe('https://victr.me/apple-touch-icon.png')
	})

	it('gets favicon as blob', async function () {
		const response = await worker.fetch('/blob/https://victr.me')
		expect(response.status).toBe(200)
		expect((await response.blob())?.type).toBe('image/png')
	})

	it('returns localhost icon with http://127.0.0.1/', async function () {
		const response = await worker.fetch('/text/http://127.0.0.1/')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(NOTFOUND)
	})

	it('returns localhost icon with http://localhost/', async function () {
		const response = await worker.fetch('/text/http://localhost/')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(LOCALHOST)
	})

	describe('examples', function () {
		let response: Awaited<ReturnType<typeof worker.fetch>>

		it('ikea.com', async function () {
			response = await worker.fetch('/text/https://ikea.com')
			expect((await response.text()) !== NOTFOUND).toBe(true)
		})

		it('vitest.dev', async function () {
			response = await worker.fetch('/text/https://vitest.dev')
			expect((await response.text()) !== NOTFOUND).toBe(true)
		})

		it('steamcharts.com', async function () {
			response = await worker.fetch('/text/https://steamcharts.com')
			expect((await response.text()) !== NOTFOUND).toBe(true)
		})

		it('guide.michelin.com', async function () {
			response = await worker.fetch('/text/https://guide.michelin.com/fr/fr/restaurants')
			expect((await response.text()) !== NOTFOUND).toBe(true)
		})

		// it('help.fr.shopping.rakuten.net', async function () {
		// 	response = await worker.fetch('/text/https://help.fr.shopping.rakuten.net')
		// 	expect((await response.text()) !== NOTFOUND).toBe(true)
		// })

		it('microsoftedge.microsoft.com', async function () {
			const url =
				'https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak'
			response = await worker.fetch('/text/' + url)
			expect((await response.text()) !== NOTFOUND).toBe(true)
		})
	})
})
