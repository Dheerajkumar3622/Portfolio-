
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cwd } from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all environment variables (including those from Render/System)
  // The third argument '' ensures we load everything, not just VITE_ prefixed ones.
  const env = loadEnv(mode, cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Replaces process.env in the code with the actual object of values.
      'process.env': JSON.stringify(env),
      // Prevents "process is not defined" error if a library uses process directly
      'process': { env: env }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});