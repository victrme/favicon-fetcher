import { expect } from "@std/expect"
import { getIconFromList, sizesToNumber, sortClosestToSize } from "../src/helpers.ts"
import type { Icon } from "../src/parsers.ts"

Deno.test("sortClosestToSize returns empty array for empty input", () => {
	const result = sortClosestToSize([], 144)
	expect(result).toEqual([])
})

Deno.test("sortClosestToSize returns single element unchanged", () => {
	const icons: Icon[] = [{ href: "/a.png", size: 32 }]
	const result = sortClosestToSize(icons, 144)
	expect(result.length).toBe(1)
	expect(result[0].href).toBe("/a.png")
})

Deno.test("sortClosestToSize sorts by closest to target size", () => {
	const icons: Icon[] = [
		{ href: "/16.png", size: 16 },
		{ href: "/144.png", size: 144 },
		{ href: "/32.png", size: 32 },
	]
	const result = sortClosestToSize(icons, 144)
	expect(result[0].href).toBe("/144.png")
	expect(result[1].href).toBe("/32.png")
	expect(result[2].href).toBe("/16.png")
})

Deno.test("sortClosestToSize preserves input order when all distances equal", () => {
	const icons: Icon[] = [
		{ href: "/a.png", size: 100 },
		{ href: "/b.png", size: 188 },
		{ href: "/c.png", size: 100 },
	]
	const result = sortClosestToSize(icons, 144)
	// all are |44| from 144, so original order preserved (stable sort)
	expect(result[0].href).toBe("/a.png")
	expect(result[1].href).toBe("/b.png")
	expect(result[2].href).toBe("/c.png")
})

Deno.test("sizesToNumber parses standard format", () => {
	expect(sizesToNumber("32x32")).toBe(32)
	expect(sizesToNumber("100x100")).toBe(100)
	expect(sizesToNumber("192x192")).toBe(192)
	expect(sizesToNumber("512x512")).toBe(512)
})

Deno.test("sizesToNumber returns default for empty string", () => {
	expect(sizesToNumber("")).toBe(48)
})

Deno.test("sizesToNumber returns default for malformed string", () => {
	expect(sizesToNumber("x100")).toBe(48)
	expect(sizesToNumber("abc")).toBe(48)
	expect(sizesToNumber("NaN")).toBe(48)
})

Deno.test("sizesToNumber handles no-argument call", () => {
	expect(sizesToNumber()).toBe(48)
	expect(sizesToNumber(undefined)).toBe(48)
})

Deno.test("sizesToNumber parses size without 'x' suffix", () => {
	// split("x")[0] returns the whole string, parseInt parses it
	expect(sizesToNumber("100")).toBe(100)
	expect(sizesToNumber("48")).toBe(48)
})

Deno.test("getIconFromList returns path for known domain", () => {
	expect(getIconFromList("https://youtube.com")).toBe("youtube.png")
	expect(getIconFromList("https://twitter.com")).toBe("twitter.png")
	expect(getIconFromList("https://claude.ai")).toBe("claude.svg")
	expect(getIconFromList("https://openai.com")).toBe("openai.svg")
})

Deno.test("getIconFromList returns undefined for unknown domain", () => {
	const result = getIconFromList("https://example-nonexistent-test.abc")
	expect(result).toBeUndefined()
})

Deno.test("getIconFromList matches localhost patterns", () => {
	expect(getIconFromList("http://localhost:8787/")).toBe("localhost.svg")
	expect(getIconFromList("http://127.0.0.1:5173")).toBe("localhost.svg")
})

Deno.test("getIconFromList matches subdomains correctly", () => {
	expect(getIconFromList("https://mail.google.com")).toBe("google.mail.png")
	expect(getIconFromList("https://drive.google.com")).toBe("google.drive.png")
	expect(getIconFromList("https://maps.google.com")).toBe("google.maps.png")
})

Deno.test("getIconFromList matches most specific subpath first", () => {
	// google.forms.png entry has "docs.google.com/forms" which is more specific
	expect(getIconFromList("https://docs.google.com/forms")).toBe(
		"google.forms.png",
	)
})

Deno.test("getIconFromList matches chatgpt.com", () => {
	expect(getIconFromList("https://chatgpt.com")).toBe("openai.svg")
})
