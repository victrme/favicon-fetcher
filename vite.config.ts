import { defineConfig } from 'vite'

export default defineConfig({
	test: {
		coverage: {
			reportsDirectory: './tests/coverage',
			provider: 'v8',
		},
	},
})
