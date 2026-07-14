import { expect } from "@std/expect"
import { parseHead, parseManifest } from "../src/parsers.ts"
import type { Manifest } from "../src/fetchers.ts"

Deno.test("parseHead returns empty icons for empty HTML", () => {
	const result = parseHead("")
	expect(result.icons).toEqual([])
	expect(result.manifest).toBeUndefined()
})

Deno.test("parseHead parses <link rel='icon'> with double quotes", () => {
	const html = `<head><link rel="icon" href="/favicon.ico" sizes="32x32"></head>`
	const result = parseHead(html)
	expect(result.icons.length).toBe(1)
	expect(result.icons[0].href).toBe("/favicon.ico")
	expect(result.icons[0].size).toBe(32)
	expect(result.icons[0].touch).toBe(false)
})

Deno.test("parseHead parses <link rel='icon'> with single quotes", () => {
	const html = `<head><link rel='icon' href='/favicon.ico' sizes='32x32'></head>`
	const result = parseHead(html)
	expect(result.icons.length).toBe(1)
	expect(result.icons[0].href).toBe("/favicon.ico")
	expect(result.icons[0].size).toBe(32)
})

Deno.test("parseHead detects apple-touch-icon from link rel", () => {
	const html = `<head><link rel="apple-touch-icon" href="/apple-touch.png" sizes="180x180"></head>`
	const result = parseHead(html)
	expect(result.icons.length).toBe(1)
	expect(result.icons[0].href).toBe("/apple-touch.png")
	expect(result.icons[0].size).toBe(180)
	expect(result.icons[0].touch).toBe(true)
})

Deno.test("parseHead detects apple-touch-icon from meta name", () => {
	const html = `<head><meta name="apple-touch-icon" content="/apple-touch.png"></head>`
	const result = parseHead(html)
	expect(result.icons.length).toBe(1)
	expect(result.icons[0].href).toBe("/apple-touch.png")
	expect(result.icons[0].size).toBe(100)
	expect(result.icons[0].touch).toBe(true)
})

Deno.test("parseHead extracts manifest link", () => {
	const html = `<head><link rel="manifest" href="/manifest.json"></head>`
	const result = parseHead(html)
	expect(result.manifest).toBe("/manifest.json")
	expect(result.icons).toEqual([])
})

Deno.test("parseHead collects multiple icons", () => {
	const html = `<head>
		<link rel="icon" href="/favicon.ico" sizes="16x16">
		<link rel="icon" href="/favicon-32.png" sizes="32x32">
		<link rel="apple-touch-icon" href="/apple-touch.png" sizes="180x180">
	</head>`
	const result = parseHead(html)
	expect(result.icons.length).toBe(3)
})

Deno.test("parseHead handles no </head> tag", () => {
	const html = `<link rel="icon" href="/favicon.ico">`
	const result = parseHead(html)
	expect(result.icons.length).toBe(1)
	expect(result.icons[0].href).toBe("/favicon.ico")
})

Deno.test("parseHead handles missing size attribute", () => {
	const html = `<head><link rel="icon" href="/favicon.ico"></head>`
	const result = parseHead(html)
	expect(result.icons.length).toBe(1)
	expect(result.icons[0].size).toBe(48)
})

Deno.test("parseHead handles no icon links at all", () => {
	const html = `<head><title>Test</title><meta charset="utf-8"></head>`
	const result = parseHead(html)
	expect(result.icons).toEqual([])
	expect(result.manifest).toBeUndefined()
})

Deno.test("parseHead handles mask-icon and fluid-icon", () => {
	const html = `<head>
		<link rel="mask-icon" href="/safari-pinned.svg" sizes="any">
		<link rel="fluid-icon" href="/fluid.png" sizes="256x256">
	</head>`
	const result = parseHead(html)
	expect(result.icons.length).toBe(2)
	expect(result.icons[0].touch).toBe(true)
	expect(result.icons[1].touch).toBe(true)
})

Deno.test("parseManifest returns empty array for empty manifest", () => {
	const result = parseManifest({})
	expect(result).toEqual([])
})

Deno.test("parseManifest returns empty array when icons field missing", () => {
	const result = parseManifest({ name: "test" } as unknown as Manifest)
	expect(result).toEqual([])
})

Deno.test("parseManifest parses manifest icons", () => {
	const manifest = {
		icons: [
			{ src: "/icon-192.png", sizes: "192x192" },
			{ src: "/icon-512.png", sizes: "512x512" },
		],
	}
	const result = parseManifest(manifest)
	expect(result.length).toBe(2)
	expect(result[0].href).toBe("/icon-192.png")
	expect(result[0].size).toBe(192)
	expect(result[0].touch).toBeFalsy()
	expect(result[1].href).toBe("/icon-512.png")
	expect(result[1].size).toBe(512)
})

Deno.test("parseManifest handles individual icons with undefined sizes", () => {
	const manifest = {
		icons: [{ src: "/icon.png" }] as Manifest["icons"],
	}
	const result = parseManifest(manifest)
	expect(result.length).toBe(1)
	expect(result[0].href).toBe("/icon.png")
	expect(result[0].size).toBe(48)
})
