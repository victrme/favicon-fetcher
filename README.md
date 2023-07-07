[![Netlify Status](https://api.netlify.com/api/v1/badges/9d4fa0d7-58db-4d47-8ccf-03b340c82c0e/deploy-status)](https://app.netlify.com/sites/extraordinary-zabaione-993955/deploys)
![Static Badge](https://img.shields.io/badge/Cloudflare%20Workers-should%20work-cab200.svg?colorA=555555&style=flat)

# favicon-fetcher

Favicon fetcher finds sites favicons and fetches them fast

### Endpoint

```HTTP
GET /:url
```

### How to use

#### Netlify Edge functions
```bash
# install
npm install --global netlify-cli

# debug
netlify dev
```

#### Cloudflare Workers
```bash
# install
npm install --global wrangler

# debug
wrangler dev

# deploy
wrangler login
wrangler deploy
```
