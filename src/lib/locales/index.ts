/* $lib/locales/index.ts */
/* Языки и механизм перевода без Svelte-компонентов — точка входа "poe-svelte-ui-lib/locales" для серверного кода, который Node запускает без Vite
   (tsx: WebSocket-сервер облака); импорты с расширением .js, чтобы их разрешал сам Node */
export * from "./languages.js"
export * from "./i18n.js"
export * from "./localize.js"
