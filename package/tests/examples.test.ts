import { expect } from "expect"

import STATIC_ICONS from "../src/icons.ts"
import favicon from "../src/index.ts"

const NOTFOUND = `${STATIC_ICONS.HOST}notfound.svg`

Deno.test("ikea.com", async function () {
	const request = new Request("http://localhost/text/https://ikea.com")
	const response = await favicon.fetch(request)

	expect(response.status).toBe(200)
	expect((await response.text()) !== NOTFOUND).toBe(true)
})

Deno.test("vitest.dev", async function () {
	const request = new Request("http://localhost/text/https://vitest.dev")
	const response = await favicon.fetch(request)

	expect(response.status).toBe(200)
	expect((await response.text()) !== NOTFOUND).toBe(true)
})

Deno.test("steamcharts.com", async function () {
	const request = new Request(
		"http://localhost/text/https://steamcharts.com",
	)
	const response = await favicon.fetch(request)

	expect(response.status).toBe(200)
	expect((await response.text()) !== NOTFOUND).toBe(true)
})

Deno.test("guide.michelin.com", async function () {
	const request = new Request("http://localhost/text/https://guide.michelin.com/fr/fr/restaurants")
	const response = await favicon.fetch(request)

	expect(response.status).toBe(200)
	expect((await response.text()) !== NOTFOUND).toBe(true)
})

Deno.test("microsoftedge.microsoft.com", async function () {
	const url = "http://localhost/text/https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak"
	const request = new Request(url)
	const response = await favicon.fetch(request)

	expect(response.status).toBe(200)
	expect((await response.text()) !== NOTFOUND).toBe(true)
})
