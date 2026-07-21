import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",

  // base: '/mobile/', // for production

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: ["icon-192.svg", "icon-512.svg", "apple-touch-icon.svg"],

      manifest: {
        name: "Medco Health Reports",

        short_name: "Medco Reports",

        description: "View your health reports and appointments on the go",

        theme_color: "#0f172a",

        background_color: "#f8fafc",

        display: "standalone",

        scope: "/",

        start_url: "/",

        orientation: "portrait",

        icons: [
          {
            src: "/icon-192.svg",

            sizes: "192x192",

            type: "image/svg+xml",

            purpose: "any maskable",
          },

          {
            src: "/icon-512.svg",

            sizes: "512x512",

            type: "image/svg+xml",

            purpose: "any maskable",
          },
        ],
      },

      devOptions: {
        enabled: true,
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "https://www.medcoclinics.com",

            handler: "NetworkFirst",

            options: {
              cacheName: "api-cache",

              expiration: {
                maxEntries: 50,

                maxAgeSeconds: 60 * 60 * 24 * 7,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: ({ request }) => request.destination === "image",

            handler: "StaleWhileRevalidate",

            options: {
              cacheName: "image-cache",

              expiration: {
                maxEntries: 100,

                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: ({ request }) => request.destination === "font",

            handler: "CacheFirst",

            options: {
              cacheName: "font-cache",

              expiration: {
                maxEntries: 20,

                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      "/medco-api": {
        target: "https://www.medcoclinics.com",

        changeOrigin: true,

        rewrite: (path) => path.replace(/^\/medco-api/, "/api"),
      },
    },

    host: true,
  },
});
