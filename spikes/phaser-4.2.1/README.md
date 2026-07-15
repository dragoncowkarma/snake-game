# SG-002 Phaser 4.2.1 compatibility spike

This directory is an isolated Wave 0 compatibility probe. It is not the product
scaffold and intentionally contains no Snake rules, persistence, audio, menu, or
shipping UI.

## Pinned toolchain

- Node.js 24.x and npm 11.18.0
- Phaser 4.2.1
- Vite 8.1.4
- TypeScript 6.0.3 in strict mode
- Playwright 1.48.2

Playwright 1.48.2 is pinned because its Chromium and WebKit revisions are the
verified combination for the available macOS 12 runner. Current Playwright no
longer installs WebKit on that operating system. The matrix should also be rerun
on a currently supported browser host before release.

## Reproduce

```sh
npm ci
npm exec -- playwright install chromium webkit
npm run typecheck
npm run build
npm run test:e2e
```

The browser test starts the production preview at
`http://127.0.0.1:4173/snake-game/` and covers Chromium and WebKit. It verifies
WebGL Scene/Graphics rendering, one Phaser keyboard event, `Scale.FIT` resizing
and centering, blur and visibility events, base-path asset requests, and the
absence of console errors, page errors, request failures, and 404 responses.

`document.hidden` is synthesized immediately before dispatching the real
`visibilitychange` event because Playwright has no cross-browser public API for
forcing a page into the hidden state.
