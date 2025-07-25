export default {
	/** Static icons are retrieved from this URL */
	HOST: "https://raw.githubusercontent.com/victrme/favicon-fetcher/main/package/icons/",

	/** List format is "filename": "urls to match" */
	LIST: {
		/* Do not modify */
		"localhost.svg": ["http://localhost", "localhost:", "http://127.0.0.1:", "127.0.0.1:"],

		/* Can be modified */
		"vscode.png": ["vscode.dev"],
		"designer.microsoft.png": ["designer.microsoft.com"],
		"teams.microsoft.png": ["teams.microsoft.com"],
		"copilot.microsoft.svg": ["https://www.bing.com/images/create", "copilot.microsoft.com"],
		"twitter.png": ["twitter.com"],
		"music.google.png": ["music.youtube.com"],
		"youtube.png": ["youtube.com"],
		"instagram.png": ["instagram.com"],
		"whatsapp.svg": ["whatsapp.com"],
		"openai.svg": ["chatgpt.com", "openai.com"],
		"discord.svg": ["discord.com"],
		"leboncoin.svg": ["leboncoin.fr"],
		"reddit.png": ["old.reddit.com", "reddit.com"],
		"spotify.svg": ["open.spotify.com", "spotify.com"],
		"google.png": ["://google.com", "www.google.com"],
		"mail.google.png": ["mail.google.com", "gmail.com"],
		"keep.google.ico": ["keep.google.com"],
		"docs.google.png": ["docs.google.com"],
		"maps.google.png": ["maps.google.com", "google.com/maps"],
		"contacts.google.png": ["contacts.google.com"],
		"messages.google.png": ["messages.google.com"],
		"podcasts.google.png": ["podcasts.google.com"],
		"calendar.google.png": ["calendar.google.com"],
		"gemini.google.svg": ["gemini.google.com"],
		"drive.google.png": ["drive.google.com"],
		"icloud.mail.png": ["icloud.com/mail/"],
		"amazon.svg": [
			"amazon.com",
			"amazon.ca",
			"amazon.fr",
			"amazon.de",
			"amazon.it",
			"amazon.co.uk",
		],

		/* Captcha protected websites */
		"shopify.png": ["shopify.com"],
		"mangafire.png": ["mangafire.to"],
		"deepseek.png": ["deepseek.com"],
		"coinmarketcap.png": ["coinmarketcap.com"],
		"pixabay.png": ["pixabay.com"],
		"kraken.png": ["kraken.com"],
	} as Record<string, string[]>,
}
