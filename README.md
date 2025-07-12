# Favicon Fetcher

Favicon fetcher finds sites favicons and fetches them fast

- Test it here: https://favicon.victr.me
- On JSR: https://jsr.io/@victr/favicon-fetcher
- On NPM: https://www.npmjs.com/package/@victr/favicon-fetcher

## Use

```ts
import favicon from "@victr/favicon-fetcher"

window.onload = async function () {
	const img = document.getElementById("some-id")
	const url = await favicon.text("https://github.com")
	img.src = url
}
```

### Types

```ts
interface Default {
	text: (query: string, options?: Options) => Promise<string>
	blob: (query: string, options?: Options) => Promise<Blob>
	fetch: (request: Request) => Promise<Response>
	list: (query: string) => Promise<string[]>
	debug: (query: string) => Promise<Debug>
}

interface Options {
	log?: true
	check?: "all" | "best" | "none"
}
```

## Publish

```bash
# Build first, using Deno & tsup
deno i
deno task build

# ESM dist/index.js 8.95 KB
# ESM ⚡️ Build success in 272ms
# DTS ⚡️ Build success in 327ms
# DTS dist/index.d.ts 1.20 KB
```

On npmjs.com

```bash
npm publish --access public

# npm notice 📦  @victr/favicon-fetcher@x.x.x
# + @victr/favicon-fetcher@x.x.x
```

On jsr.io

```bash
deno publish

# Publishing @victr/favicon-fetcher@x.x.x ...
# Successfully published @victr/favicon-fetcher@x.x.x
```

## Cloudflare workers

Use can easily deploy favicon-fetcher as a worker because it uses the same `export fetch()`.\
To do so:

```bash
npm install --global wrangler

# added 173 packages in 11s

wrangler deploy ./package/src/index.ts --name favicon-fetcher --compatibility-date 2025-01-13

# Total Upload: 9.70 KiB / gzip: 3.15 KiB
# Uploaded favicon-fetcher (8.11 sec)
```
