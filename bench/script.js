const providers = [
	"https://api.favicon.victr.me/blob/https://%query%",
	"https://icon.horse/icon/%query%",
	"https://www.google.com/s2/favicons?domain=%query%&sz=128",
	"https://icons.duckduckgo.com/ip3/%query%.ico",
]

const quality = ["wikipedia.org", "open.spotify.com", "icon.horse", "ko-fi.com"]

const mostUsed =
	"google.com,youtube.com,facebook.com,twitter.com,instagram.com,baidu.com,wikipedia.org,yandex.ru,yahoo.com,whatsapp.com,amazon.com,netflix.com,tiktok.com,reddit.com,linkedin.com,qq.com,taobao.com,office.com,microsoft.com,zoom.us,twitch.tv,github.com,bing.com,live.com,pinterest.com,bilibili.com,apple.com,ebay.com,wordpress.com,vk.com,gmail.com,weibo.com,adobe.com,canva.com,spotify.com,microsoft365.com,discord.com,naver.com,outlook.com,imdb.com,paypal.com,chatgpt.com,shopify.com,walmart.com,tmall.com,indeed.com,stackoverflow.com,weather.com,dropbox.com,cloudflare.com,telegram.org,booking.com,aliexpress.com,jd.com,alipay.com,duckduckgo.com,quora.com,tumblr.com,force.com,salesforce.com,amazonaws.com,blogger.com,cnn.com,etsy.com,espn.com,bbc.com,fandom.com,tencent.com,googlevideo.com,mail.ru,roblox.com,github.io,nytimes.com,openai.com,microsoftonline.com,medium.com,dailymotion.com,notion.so,hubspot.com,grammarly.com,slack.com,youku.com,firebase.com,cloudfront.net,ok.ru,tradingview.com,zillow.com,flipkart.com,craigslist.org,wordpress.org,webex.com,figma.com,behance.net,snapchat.com,coursera.org,wix.com,instructure.com,aol.com,udemy.com,trello.com"
		.split(",")

function qualityTable() {
	const tbody = document.getElementById("quality-table-body")

	for (const query of quality) {
		const tr = document.createElement("tr")

		for (const provider of providers) {
			const td = document.createElement("td")
			const img = document.createElement("img")

			img.src = provider.replace("%query%", query)
			img.alt = ""
			img.width = "128"
			img.height = "128"

			td.appendChild(img)
			tr.appendChild(td)
		}

		tbody.appendChild(tr)
	}
}

function mostUsedWebsites() {
	const container = document.getElementById("most-used")

	for (const provider of providers) {
		const h3 = document.createElement("h3")
		const div = document.createElement("div")

		h3.textContent = provider

		for (const website of mostUsed) {
			const img = document.createElement("img")

			img.src = provider.replace("%query%", website)
			img.alt = ""
			img.width = "16"
			img.height = "16"

			div.appendChild(img)
		}

		container.appendChild(h3)
		container.appendChild(div)
	}
}

globalThis.addEventListener("load", function () {
	mostUsedWebsites()
	qualityTable()
})
