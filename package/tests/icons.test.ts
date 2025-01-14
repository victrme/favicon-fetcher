import { expect } from "expect"

import STATIC_ICONS from "../src/icons.ts"

Deno.test("Static icons has valid type", function () {
	expect(typeof STATIC_ICONS.LIST).toBe("object")

	for (const [path, match] of Object.entries(STATIC_ICONS.LIST)) {
		expect(typeof path).toBe("string")
		expect(typeof match).toBe("object")
		expect(match.length).toBeGreaterThan(0)
	}
})
