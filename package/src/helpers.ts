import STATIC_ICONS from "./icons"
import type { Head, Icon } from "./parsers"

export function sortClosestToSize(icons: Icon[], val: number): Icon[] {
	const sorted = icons.sort((a, b) => Math.abs(a.size - val) - Math.abs(b.size - val))
	return sorted
}

export function sizesToNumber(str = ""): number {
	return parseInt(str?.split("x")[0]) || 48
}

export function getIconFromList(query: string): string | undefined {
	const iconList = Object.entries(STATIC_ICONS.LIST)

	for (const [path, matches] of iconList) {
		for (const match of matches) {
			if (query.includes(match)) return path
		}
	}
}

// 	Loggers & debuggers

let canLog = false
let canDebug = false
let debugList: Debug = {}

export function initLog(val: boolean): void {
	canLog = val
}

export function initDebug(): void {
	debugList = {}
	canDebug = true
}

export function toDebug(key: keyof Debug, value: any) {
	if (canDebug) {
		debugList[key] = value
	}
}

export function toLog(...logs: string[]) {
	if (canLog) {
		logs.forEach(console.error)
	}
}

export function getDebug(): Debug {
	return debugList
}

export interface Debug {
	html?: string
	head?: Head
	metas?: string[]
	links?: string[]
	manifest?: string[]
	paths?: string[]
}
