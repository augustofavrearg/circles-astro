import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

export default defineConfig({
  integrations: [
    react(),
    // This project consumes Wix APIs but does not define Wix backend extensions.
    // Disabling their dev-server hook avoids a Wix/Vite restart race where
    // `wix:server:start` can run before `wix:model:setup`.
    wix({ backendExtensions: false }),
    wixPages(),
  ],

  server: {
    host: true,
    port: 4321,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: wixHostingAdapter(),

  image: {
    domains: ["static.wixstatic.com"],
  },

  output: "server",
});
