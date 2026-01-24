import { defineConfig } from 'orval';

export default defineConfig({
  'aboard-api': {
    input: './openapi.json',
    output: './src/lib/api-client.ts',
  },
});
