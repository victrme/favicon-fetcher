# favicon fetcher

Favicon fetcher finds sites favicons and fetches them fast

Test it here: https://favicon.victr.me

## Install

```bash
npm i @victr/favicon-fetcher
```

### Example use

```js
import favicon from '@victr/favicon-fetcher'

window.onload = async function () {
  const img = document.getElementById('some-id')
  const url = await favicon.text('https://github.com')

  img.src = url
}
```

### Export type

```ts
export default {
  text: (query: string) => Promise<string>,
  blob: (query: string) => Promise<Blob>,
}
```

## As API

### Endpoints

Protocols need to be included in the `:url` query. You can get your favicon as a plaintext url or a blob:

```HTTP
GET /text/:url
```

```HTTP
GET /blob/:url
```
