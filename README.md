# favicon fetcher

Favicon fetcher finds sites favicons and fetches them fast

Test it here: https://favicon.victr.me

### Use

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
export default {
  text: (query: string, fast?: true) => Promise<string>
  blob: (query: string, fast?: true) => Promise<Blob>
  list: (query: string) => Promise<string[]>
  fetch: (request: Request) => Promise<Response>
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

# Publish on npmjs.com
npm publish --access public

# npm notice 📦  @victr/favicon-fetcher@x.x.x
# ...
# + @victr/favicon-fetcher@x.x.x


# Publish on jsr.io
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
