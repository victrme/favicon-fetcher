'use strict'

window.addEventListener('DOMContentLoaded', () => {
	document.getElementById('search-form')?.addEventListener('submit', submitSearch)
})

async function submitSearch(event) {
	event.preventDefault()

	const img = document.getElementById('favicon-img')
	const input = document.getElementById('search-input')
	const mockimg = document.createElement('img')

	if (input.value.length < 4) {
		return
	}

	img.classList.add('loading')

	const value = input.value.startsWith('http') ? input.value : `https://${input.value}`
	const resp = await fetch('https://api.favicon.victr.me/text/' + value)
	const icon = await resp.text()

	mockimg.src = icon
	await new Promise((r) => mockimg.addEventListener('load', r))

	img.src = icon
	img.classList.remove('loading')

	input.blur()
}
