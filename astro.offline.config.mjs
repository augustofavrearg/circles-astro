import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Versioned offline profile: fixtures only, without the Wix-managed runtime.
export default defineConfig({
  integrations: [react()],
  devToolbar: { enabled: false },
  output: "server",
  vite: { plugins: [tailwindcss()] },
});
