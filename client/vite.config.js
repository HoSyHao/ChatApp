import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [react(),nodePolyfills()],
  define: {
    'process.env': {},
    global: 'window', // Giả lập biến global
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: "stream-browserify", // Giả lập module stream của Node.js
      buffer: "buffer",           // Giả lập module buffer của Node.js
    },
  },
})
