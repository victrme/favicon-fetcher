import { describe, it, expect, expectTypeOf } from 'vitest'
import { localhost, notfound } from '../src/assets/icons'
import { dataUriToBlob } from '../src/index'
import { websites } from '../src/assets/websites'

// > wrangler dev
// > ⎔ Starting local server...
const origin = 'http://127.0.0.1:8787'

describe('Static icons', function () {
	it('are both SVG data URIs', function () {
		expect(localhost.startsWith('data:image/svg+xml;base64,')).toBe(true)
		expect(notfound.startsWith('data:image/svg+xml;base64,')).toBe(true)
	})

	it('can be converted to Blobs', function () {
		expect(dataUriToBlob(localhost)?.type).toBe('image/svg+xml')
		expect(dataUriToBlob(notfound)?.type).toBe('image/svg+xml')
	})
})

describe('Website list', function () {
	it('is of valid type', function () {
		expectTypeOf(websites).toBeArray()
		expectTypeOf(websites[0]).toBeObject()
		expectTypeOf(websites[0].url).toBeString()
		expect(Array.isArray(websites[0].domain) || typeof websites[0].domain === 'string').toBe(true)
	})

	it('has more than 1 domain when type is array', function () {
		if (Array.isArray(websites[0].domain)) {
			expect(websites[0].domain.length).toBeGreaterThan(1)
		}
	})
})

describe('Fetching', function () {
	it('returns notfound icon on empty query', async function () {
		const response = await fetch(origin + '')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(notfound)
	})

	it('returns notfound icon on bad query', async function () {
		const response = await fetch(origin + '/text/drgrdrdhwrdehrwjherwjh')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(notfound)
	})

	it('returns notfound icon when no protocols are specified', async function () {
		const response = await fetch(origin + '/text/victr.me/')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(notfound)
	})

	it('gets favicon as text when no type specified', async function () {
		const response = await fetch(origin + '/https://victr.me')
		expect(response.status).toBe(200)
		expect(await response.text()).toContain('https://')
	})

	it('gets favicon as text with old /get/ path', async function () {
		const response = await fetch(origin + '/get/https://victr.me')
		expect(response.status).toBe(200)
		expect(await response.text()).toContain('https://')
	})

	it('gets favicon as text', async function () {
		const response = await fetch(origin + '/text/https://victr.me')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe('https://victr.me/apple-touch-icon.png')
	})

	it('gets favicon as blob', async function () {
		const response = await fetch(origin + '/blob/https://victr.me')
		expect(response.status).toBe(200)
		expect((await response.blob())?.type).toBe('image/png')
	})

	it('returns localhost icon with http://127.0.0.1/', async function () {
		const response = await fetch(origin + '/text/http://127.0.0.1/')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(localhost)
	})

	it('returns localhost icon with http://localhost/', async function () {
		const response = await fetch(origin + '/text/http://localhost/')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe(localhost)
	})

	describe('examples', function () {
		let response: Response

		it('ikea.com', async function () {
			response = await fetch(origin + '/text/https://ikea.com')
			expect((await response.text()) !== notfound).toBe(true)
		})

		it('vitest.dev', async function () {
			response = await fetch(origin + '/text/https://vitest.dev')
			expect((await response.text()) !== notfound).toBe(true)
		})

		it('steamcharts.com', async function () {
			response = await fetch(origin + '/text/https://steamcharts.com')
			expect((await response.text()) !== notfound).toBe(true)
		})

		it.todo('fr.aliexpress.com is timing out')
		// it('fr.aliexpress.com', async function () {
		// 	response = await fetch(origin + '/text/https://fr.aliexpress.com')
		// 	expect((await response.text()) !== notfound).toBe(true)
		// })

		it('microsoftedge.microsoft.com', async function () {
			const url = 'https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak'
			response = await fetch(origin + '/text/' + url)
			expect((await response.text()) !== notfound).toBe(true)
		})

		it('guide.michelin.com', async function () {
			const url = 'https://guide.michelin.com/fr/fr/restaurants'
			response = await fetch(origin + '/text/' + url)
			expect((await response.text()) !== notfound).toBe(true)
		})

		it('help.fr.shopping.rakuten.net', async function () {
			const url = 'https://help.fr.shopping.rakuten.net'
			response = await fetch(origin + '/text/' + url)
			expect((await response.text()) !== notfound).toBe(true)
		})
	})
})
