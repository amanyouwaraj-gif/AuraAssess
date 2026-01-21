
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Explicitly import process to fix TypeScript 'cwd' property error
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL || ''),
    },
    server: {
      port: 5173,
      host: true
    }
  };
});
