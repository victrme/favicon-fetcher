import { expect } from "expect"

import STATIC_ICONS from "../src/icons.ts"
import favicon from "../src/index.ts"

const LOCALHOST = `${STATIC_ICONS.HOST}localhost.svg`
const NOTFOUND = `${STATIC_ICONS.HOST}notfound.svg`

Deno.test("returns notfound icon on bad query", async function () {
	const request = new Request(
		"http://0.0.0.0:0000/text/drgrdrdhwrdehrwjherwjh",
	)
	const response = await favicon.fetch(request)
	expect(response.status).toBe(200)
	expect(await response.text()).toBe(NOTFOUND)
})

Deno.test("returns notfound icon when no protocols are specified", async function () {
	const response = await favicon.fetch(
		new Request("http://0.0.0.0:0000/text/victr.me/"),
	)
	expect(response.status).toBe(200)
	expect(await response.text()).toBe(NOTFOUND)
})

Deno.test("returns 400 when no type are specified", async function () {
	const response = await favicon.fetch(
		new Request("http://0.0.0.0:0000/https://victr.me"),
	)
	expect(response.status).toBe(400)
})

Deno.test("gets favicon as text", async function () {
	const response = await favicon.fetch(
		new Request("http://0.0.0.0:0000/text/https://victr.me"),
	)
	expect(response.status).toBe(200)
	expect(await response.text()).toBe(
		"https://victr.me/apple-touch-icon.png",
	)
})

Deno.test("gets favicon as blob", async function () {
	const response = await favicon.fetch(
		new Request("http://0.0.0.0:0000/blob/https://victr.me"),
	)
	expect(response.status).toBe(200)
	expect((await response.blob())?.type).toBe("image/png")
})

Deno.test("returns localhost icon with http://127.0.0.1", async function () {
	const response = await favicon.fetch(
		new Request("http://0.0.0.0:0000/text/http://127.0.0.1:8787"),
	)
	expect(response.status).toBe(200)
	expect(await response.text()).toBe(LOCALHOST)
})

Deno.test("returns localhost icon with http://localhost/", async function () {
	const response = await favicon.fetch(
		new Request("http://0.0.0.0:0000/text/http://localhost/"),
	)

	expect(response.status).toBe(200)
	expect(await response.text()).toBe(LOCALHOST)
})
