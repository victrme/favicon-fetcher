import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: "package/src/index.ts",
  format: "esm",
  clean: true,
  dts: true,
})
