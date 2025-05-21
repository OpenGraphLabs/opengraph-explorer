import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
// wasm reference: https://jw910911.tistory.com/177
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
  ],
  // optimizeDeps: {
  //   exclude: ["@mysten/walrus"],
  // },
  assetsInclude: ["**/*.wasm"],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split(".").pop();
          if (/wasm/i.test(extType)) {
            return "static/js/[name][extname]"; // wasm 파일인 경우 js 폴더 경로 안에서 참조됨.
          }
          return `static/${extType}/[name]-[hash][extname]`;
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
