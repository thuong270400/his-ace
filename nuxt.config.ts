// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv';

// Nạp biến môi trường từ tệp .env
dotenv.config();
export default defineNuxtConfig({
  // devtools: { enabled: true },
  hooks: {
    'pages:extend'(routes) {
      //
    }
  },
  runtimeConfig: {
    secret_DOMAIN: process.env.DOMAIN,
    public: {
      DOMAIN: process.env.DOMAIN,
    }
  },
  css: ['vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  modules: [
    // ...
    '@pinia/nuxt',
  ],
})
