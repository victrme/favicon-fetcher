# favicon fetcher

Favicon fetcher finds sites favicons and fetches them fast

## Install as a node module

```bash
npm i @victr/favicon-fetcher
```

#### Example use
```js
import favicon from '@victr/favicon-fetcher'

window.onload = async function () {
  const img = document.getElementById('some-id')
  const url = await favicon.url('https://github.com')

  img.src = url
}
```

#### Export type

```ts
export default {
  url: (query: string) => Promise<string>,
  img: (query: string) => Promise<Blob>,
}
```

## Install as an API

### Endpoints

Protocols need to be included in the `:url` query. You can get your favicon as a plaintext url or a blob:

```HTTP
GET /text/:url
```

```HTTP
GET /blob/:url
```

### Cloudflare Workers

```bash
# install
pnpm --filter cloudflare i

# debug
pnpm --filter cloudflare dev

# deploy
pnpm --filter cloudflare deploy
```
