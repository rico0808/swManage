import Vue from "@vitejs/plugin-vue";
import { defineConfig } from "@midwayjs/hooks-kit";
import JSX from "@vitejs/plugin-vue-jsx";
import path from "path";
import WindiCSS from "vite-plugin-windicss";
import viteArco from "@arco-plugins/vite-vue";

export default defineConfig({
  vite: {
    plugins: [
      Vue(),
      JSX(),
      WindiCSS(),
      viteArco({
        theme: "@arco-themes/vue-own-rico",
        style: true,
      }),
    ],
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
    },
    css: {
      modules: {
        generateScopedName: "[local]_[hash:base64:5]",
        hashPrefix: "modules",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
  },
});
