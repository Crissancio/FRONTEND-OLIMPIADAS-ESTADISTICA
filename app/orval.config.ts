import { defineConfig } from 'orval';

export default defineConfig({
  backend: {
    input: 'http://localhost:8000/openapi.json',
    
    output: {
      mode: 'tags-split',
      target: './src/app/api/gen/endpoints',
      schemas: './src/app/api/gen/models',
      client: 'axios',
      
      override: {
        mutator: {
          path: './src/app/api/mutator.ts',
          name: 'customInstance',
        },
      },
    },
  },
});