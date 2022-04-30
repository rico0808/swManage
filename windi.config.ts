import { defineConfig } from "windicss/helpers";

export default defineConfig({
  theme: {
    extend: {
      screens: {
        sm: "480px",
        md: "640px",
        lg: "768px",
        xl: "1024px",
        "2xl": "1280px",
      },
    },
  },
});
