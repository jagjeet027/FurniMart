import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ensure environment variables are loaded
  define: {
    'process.env': process.env
  }
});


// // vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import dotenv from 'dotenv';

// dotenv.config();

// export default defineConfig({
//   plugins: [react()],
// });
