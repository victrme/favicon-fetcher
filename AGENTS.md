# AGENTS.md — @victr/favicon-fetcher

## Project Conventions

### No Regex for HTML/Structured Text Parsing

Use string manipulation (`split`, `slice`, `indexOf`, `substring`) over regex for parsing HTML, URLs, and structured text.

**Never** use regex for:

- HTML parsing or tag extraction
- URL matching or manipulation
- Attribute extraction
- HTML entity decoding
- ANY parsing task that can be done with basic string manipulation

**Always** use string manipulation methods or a proper HTML parser instead. Examples:

- `indexOf`, `includes`, `startsWith`, `endsWith` for matching
- `split`, `slice`, `substring` for extraction
- `replaceAll` for quote normalization
- `URL` API and `URLPattern` for URL parsing/formatting

### Testing

- Uses Deno test runner (`deno test --allow-net --allow-read`)

### Build

- Bundler: `tsdown` (configured in `tsdown.config.ts`)
- Entry: `package/src/index.ts`
- Output: `dist/` (ESM + TypeScript types)

### Dependencies

- Runtime: none (Deno stdlib via JSR imports)
- Build: `tsdown`, `typescript`
