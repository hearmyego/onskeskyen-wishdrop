# Wishdrop for Ønskeskyen

> **Unofficial.** Not affiliated with or endorsed by Ønskeskyen / GoWish.

Firefox extension (+ Firefox-based browsers). Toolbar click on product page → Ønskeskyen quick-add opens in centred popup → pick wishlist → popup closes.

```
https://onskeskyen.dk/da/quick-add?crawlerTarget=<encoded product URL>
```

- Ønskeskyen scrapes product itself. Not logged in → it asks.
- Button pinned to toolbar (`action.default_area: "navbar"`).
- **Nothing stored, nothing collected.** Uses only:
  - `activeTab`: read current URL on click
  - content script on `onskeskyen.dk/*quick-add*`: hears "done" signal → closes popup

## Layout

```
src/manifest.json        MV3 manifest
src/background.js        click → popup; close on request
src/quick-add-close.js   content script, forwards page's "onClose"
src/icons/               icon.svg (source) + PNGs (vpr icons)
scripts/icons.js         SVG → PNG 16/32/48/96/128
amo-metadata.json        AMO listing: summary, description (EN/DA), category, license
test/                    unit tests
```

## Quick-add internals

From Ønskeskyen frontend bundle (`pages/quick-add-*.js`). Undocumented, may change.

| Param            | Effect                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------- |
| `crawlerTarget`  | Product URL. Only param affecting what's added.                                         |
| `metadataSource` | Analytics only. Default `PartnerWishButton`. `ProductSearch` reads `sourceId` from URL. |
| `source`         | Analytics only.                                                                         |

- No params for title/price/image/note/wishlist → set in form.
- Logged out → `/login?origin=quickadd&redirect=…` → back after login.
- Close: page built for shop iframes; calls `window.top.postMessage("onClose")` 700 ms after save + on ✕. In popup, `top` = page itself → content script catches it → background closes popup.

## Dev

[Vite+](https://viteplus.dev) (`vp`) for install/test/lint/fmt/types. `web-ext` for run/package.
**pnpm only** (pinned in `devEngines`). Vite+ aliasing in `pnpm-workspace.yaml`. Commit `pnpm-lock.yaml`.

```sh
vp install     # deps + pre-commit hook
vpr dev        # Firefox w/ extension, live reload
vpr test       # tests once (vp test = watch)
vp check       # fmt + lint + types (--fix)
vpr validate   # vp check + web-ext lint
vpr build      # zip → dist/
vpr icons      # regenerate PNGs after editing icon.svg
vpr release    # sign + submit listed version to AMO
```

- Other Firefox: `WEB_EXT_FIREFOX=nightly vpr dev` or `=/path/to/firefox`.
- Pre-commit: `vp check --fix` on staged files.

## Testing

**Auto:** `vpr test && vpr validate`. Covers URL building, addable pages, closable pages, popup centring + manifest lint.

**Manual:**

1. `vpr dev` (fresh temp profile → log in to onskeskyen.dk there).
2. Cloud button in toolbar. Missing → old unpinned install remembered; reinstall or pin via extensions menu.
3. Open product (elgiganten.dk, proshop.dk, zalando.dk) → click.
4. Expect:
   - 480×760 popup, centred, showing quick-add URL
   - product title/image/price shown
   - pick wishlist → wish in account
   - ~0.7 s after save → popup closes, back on product
   - ✕ also closes popup
5. Negative: `about:` pages + onskeskyen.dk pages → nothing.
6. Debug: `about:debugging#/runtime/this-firefox` → **Inspect**.

## Publishing (AMO)

One-time:

1. Create an account at [addons.mozilla.org](https://addons.mozilla.org/developers/).
2. Developer Hub → Tools → **Manage API Keys**. Get the JWT issuer + secret.

Release:

1. Bump `version` in `src/manifest.json` + `package.json`.
2. `vpr test && vpr validate`
3. Run:
   ```sh
   WEB_EXT_API_KEY=user:… WEB_EXT_API_SECRET=… vpr release
   ```
   - First run creates the listing from `amo-metadata.json`.
   - Signed `.xpi` → `dist/`. Review usually takes minutes to hours.
4. AMO dashboard (first time): add screenshots + icon (`src/icons/icon-128.png`).
5. Tag: `git tag v<version> && git push --tags`

- Never commit API keys.
- Gecko ID `wishdrop@hearmyego.github.io` is permanent. Never change it.
- `vpr sign:unlisted`: self-distributed signed `.xpi`, no listing.

## Install

- **Temporary:** `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → `src/manifest.json`. Gone on restart.
- **Permanent:** release Firefox needs signing. AMO "unlisted" via `web-ext sign`. Dev Edition/Nightly/ESR: `xpinstall.signatures.required = false`.

## License

[MIT](LICENSE)
