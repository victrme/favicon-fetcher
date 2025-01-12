export default {
	/** Static icons are retrieved from this URL */
	HOST: 'https://raw.githubusercontent.com/victrme/favicon-fetcher/main/package/icons/',

	/** List format is "filename": "urls to match" */
	LIST: {
		/* Do not modify */
		'localhost.svg': ['http://localhost', 'localhost:', '127.0.0.1:', '0.0.0.0:'],

		/* Can be modified */
		'vscode.png': ['vscode.dev'],
		'designer.microsoft.png': ['designer.microsoft.com'],
		'copilot.microsoft.svg': ['https://www.bing.com/images/create', 'copilot.microsoft.com'],
		'twitter.svg': ['twitter.com'],
		'youtube.png': ['youtube.com'],
		'instagram.png': ['instagram.com'],
		'whatsapp.png': ['whatsapp.com'],
		'reddit.png': ['old.reddit.com', 'reddit.com'],
		'spotify.svg': ['open.spotify.com', 'spotify.com'],
		'google.png': ['://google.com', 'www.google.com'],
		'mail.google.png': ['mail.google.com', 'gmail.com'],
		'keep.google.ico': ['keep.google.com'],
		'docs.google.png': ['docs.google.com'],
		'maps.google.png': ['maps.google.com', 'google.com/maps'],
		'contacts.google.png': ['contacts.google.com'],
		'messages.google.png': ['messages.google.com'],
		'podcasts.google.png': ['podcasts.google.com'],
		'calendar.google.png': ['calendar.google.com'],
		'drive.google.png': ['drive.google.com'],
		'music.google.png': ['music.youtube.com'],
		'icloud.mail.png': ['icloud.com/mail/'],
		'amazon.svg': ['amazon.com', 'amazon.ca', 'amazon.fr', 'amazon.de', 'amazon.it', 'amazon.co.uk'],
	} as Record<string, string[]>,
}
