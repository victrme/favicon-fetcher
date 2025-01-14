"use strict"

globalThis.addEventListener("DOMContentLoaded", () => {
	document.getElementById("search-form")?.addEventListener("submit", submitSearch)
	document.getElementById("favicon-img")?.addEventListener("click", openBigIconModal)
	document.getElementById("big-icon-modal")?.addEventListener("click", closeBigIconModal)
})

async function submitSearch(event) {
	event.preventDefault()

	const big = document.getElementById("big-icon-modal_favicon-img")
	const img = document.getElementById("favicon-img")
	const input = document.getElementById("search-input")
	const mockimg = document.createElement("img")

	if (input.value.length < 4) {
		return
	}

	img.classList.add("loading")

	const value = input.value.startsWith("http") ? input.value : `https://${input.value}`
	const resp = await fetch("https://api.favicon.victr.me/text/" + value)
	const icon = await resp.text()

	mockimg.src = icon
	await new Promise((r) => mockimg.addEventListener("load", r))

	img.src = icon
	big.src = icon
	img.classList.remove("loading")

	input.blur()
}

function openBigIconModal() {
	document.getElementById("big-icon-modal")?.showModal()
}

function closeBigIconModal(event) {
	if (event.target?.tagName === "DIALOG") {
		document.getElementById("big-icon-modal")?.close()
	}
}
