import { it, describe, expect, expectTypeOf } from 'vitest'
import STATIC_ICONS from './icons'
import favicon from './index'

const LOCALHOST = `${STATIC_ICONS.HOST}localhost.svg`
const NOTFOUND = `${STATIC_ICONS.HOST}notfound.svg`

describe('Static icons', function () {
	it('has valid type', function () {
		expectTypeOf(STATIC_ICONS.LIST).toBeObject()

		for (const [path, match] of Object.entries(STATIC_ICONS.LIST)) {
			expectTypeOf(path).toBeString()
			expectTypeOf(match).toBeArray()
			expect(match.length).toBeGreaterThan(0)
		}
	})
})

describe('Fetching', function () {
	it('returns notfound icon on bad query', async function () {
		const request = new Request('http://0.0.0.0:0000/text/drgrdrdhwrdehrwjherwjh')
		const response = await favicon.fetch(request)
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(NOTFOUND)
	})

	it('returns notfound icon when no protocols are specified', async function () {
		const response = await favicon.fetch(new Request('http://0.0.0.0:0000/text/victr.me/'))
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(NOTFOUND)
	})

	it('returns 400 when no type are specified', async function () {
		const response = await favicon.fetch(new Request('http://0.0.0.0:0000/https://victr.me'))
		expect(response.status).toBe(400)
	})

	it('gets favicon as text', async function () {
		const response = await favicon.fetch(new Request('http://0.0.0.0:0000/text/https://victr.me'))
		expect(response.status).toBe(200)
		expect(await response.text()).toBe('https://victr.me/apple-touch-icon.png')
	})

	it('gets favicon as blob', async function () {
		const response = await favicon.fetch(new Request('http://0.0.0.0:0000/blob/https://victr.me'))
		expect(response.status).toBe(200)
		expect((await response.blob())?.type).toBe('image/png')
	})

	it('returns localhost icon with http://127.0.0.1', async function () {
		const response = await favicon.fetch(new Request('http://0.0.0.0:0000/text/http://127.0.0.1:8787'))
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(LOCALHOST)
	})

	it('returns localhost icon with http://localhost/', async function () {
		const response = await favicon.fetch(new Request('http://0.0.0.0:0000/text/http://localhost/'))

		expect(response.status).toBe(200)
		expect(await response.text()).toBe(LOCALHOST)
	})
})

describe('Examples', function () {
	it('ikea.com', async function () {
		const request = new Request('http://localhost/text/https://ikea.com')
		const response = await favicon.fetch(request)

		expect(response.status).toBe(200)
		expect((await response.text()) !== NOTFOUND).toBe(true)
	})

	it('vitest.dev', async function () {
		const request = new Request('http://localhost/text/https://vitest.dev')
		const response = await favicon.fetch(request)

		expect(response.status).toBe(200)
		expect((await response.text()) !== NOTFOUND).toBe(true)
	})

	it('steamcharts.com', async function () {
		const request = new Request('http://localhost/text/https://steamcharts.com')
		const response = await favicon.fetch(request)

		expect(response.status).toBe(200)
		expect((await response.text()) !== NOTFOUND).toBe(true)
	})

	it('guide.michelin.com', async function () {
		const request = new Request('http://localhost/text/https://guide.michelin.com/fr/fr/restaurants')
		const response = await favicon.fetch(request)

		expect(response.status).toBe(200)
		expect((await response.text()) !== NOTFOUND).toBe(true)
	})

	// it('help.fr.shopping.rakuten.net', async function () {
	//	const request = new Request('http://localhost/text/https://help.fr.shopping.rakuten.net')
	// 	const response = await favicon.fetch(request)

	//	expect((response.status)).toBe(200)
	// 	expect((await response.text()) !== NOTFOUND).toBe(true)
	// })

	it('microsoftedge.microsoft.com', async function () {
		const url =
			'http://localhost/text/https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak'
		const request = new Request(url)
		const response = await favicon.fetch(request)

		expect(response.status).toBe(200)
		expect((await response.text()) !== NOTFOUND).toBe(true)
	})
})
