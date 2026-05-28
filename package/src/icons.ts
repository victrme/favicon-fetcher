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
		"grok.svg": ["grok.com"],
		"claude.svg": ["claude.ai"],
		"openai.svg": ["chatgpt.com", "openai.com"],
		"discord.svg": ["discord.com"],
		"leboncoin.svg": ["leboncoin.fr"],
		"reddit.png": ["old.reddit.com", "reddit.com"],
		"spotify.svg": ["open.spotify.com", "spotify.com"],
		"google/search.png": ["://google.com", "www.google.com"],
		"google/mail.png": ["mail.google.com", "gmail.com"],
		"google/keep.svg": ["keep.google.com"],
		"google/sheets.ico": ["docs.google.com/spreadsheets"],
		"google/slides.ico": ["docs.google.com/presentation"],
		"google/forms.ico": ["docs.google.com/forms"],
		"google/docs.ico": ["docs.google.com"],
		"google/maps.png": ["maps.google.com", "google.com/maps"],
		"google/meet.png": ["meet.google.com"],
		"google/chat.png": ["chat.google.com"],
		"google/tasks.png": ["tasks.google.com"],
		"google/photos.png": ["photos.google.com"],
		"messages.google.png": ["messages.google.com"],
		"podcasts.google.png": ["podcasts.google.com"],
		"google/calendar.png": ["calendar.google.com"],
		"gemini.google.svg": ["gemini.google.com"],
		"google/drive.png": ["drive.google.com"],
		"icloud.mail.png": ["icloud.com/mail/"],
		"amazon.svg": [
			"amazon.com",
			"amazon.ca",
			"amazon.fr",
			"amazon.de",
			"amazon.it",
			"amazon.co.uk",
		],
		"ambank.png": ["amonline.com"],
		"postman.png": ["postman.co"],

		/* Captcha protected websites */
		"shopify.png": ["shopify.com"],
		"mangafire.png": ["mangafire.to"],
		"deepseek.png": ["deepseek.com"],
		"coinmarketcap.png": ["coinmarketcap.com"],
		"pixabay.png": ["pixabay.com"],
		"kraken.png": ["kraken.com"],
	} as Record<string, string[]>,
}
