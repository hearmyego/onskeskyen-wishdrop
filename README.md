# Wishdrop for Ønskeskyen

> **Unofficial.** Not affiliated with or endorsed by Ønskeskyen / GoWish.

Firefox extension (+ Firefox-based browsers). Toolbar click on product page → Ønskeskyen quick-add opens in centred popup → pick wishlist → popup closes.

```
https://onskeskyen.dk/da/quick-add?crawlerTarget=<encoded product URL>
```

- Ønskeskyen scrapes product itself. Not logged in → it asks.
- Button pinned to toolbar (`action.default_area: "navbar"`).
- **Nothing stored. Only data sent: current page URL → Ønskeskyen, on click.** Declared as `browsingActivity`
  (implicit consent: single click, URL only). See [PRIVACY.md](PRIVACY.md). Uses:
  - `activeTab`: read current URL on click
  - content script on `onskeskyen.dk/*quick-add*`: hears "done" signal → closes popup

## Layout

```
src/manifest.json        MV3 manifest
src/background.js        click → popup; close on request
src/quick-add-close.js   content script, forwards page's "onClose"
src/icons/               icon.svg (source) + PNGs (vpr icons)
scripts/icons.js         SVG → PNG 16/32/48/96/128
amo-metadata.json        AMO listing text (EN/DA), category, license
PRIVACY.md               privacy policy (paste into AMO)
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
vpr release    # optional: submit new version to AMO via API
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

Per [Extension Workshop: Submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/).

**Before:** read [Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/) + [Distribution Agreement](https://extensionworkshop.com/documentation/publish/firefox-add-on-distribution-agreement/).

**First submission (manual, web):**

1. `vpr test && vpr validate && vpr build` → `dist/onskeskyen-wishdrop-<version>.zip`
2. Log in at [addons.mozilla.org](https://addons.mozilla.org) with a Mozilla account.
3. [Developer Hub → Submit a New Add-on](https://addons.mozilla.org/developers/addon/submit/) → **On this site** (listed).
4. Upload the zip → validator must pass. Fix warnings too.
5. Platform: Firefox desktop. (Android: no; `default_area` / popup windows are desktop-only.)
6. Source code needed? **No.** Plain, unminified JS, no build step.
7. Describe add-on (text in `amo-metadata.json`):
   - Name: from manifest. URL slug: `wishdrop`
   - Summary + description: EN, then add DA locale
   - Experimental: no. Requires payment: no
   - Categories: Shopping
   - Support site: `https://github.com/hearmyego/onskeskyen-wishdrop/issues`
   - License: MIT
   - **Privacy policy: yes** → paste `PRIVACY.md`
   - Notes for reviewers: see below
8. Submit Version. It's live right away; review may come later. You get an email.
9. Afterwards: screenshots + icon (`src/icons/icon-128.png`) in the listing.
10. `git tag v<version> && git push --tags`

**Notes for reviewers (paste):**

```
Unofficial helper for Ønskeskyen (onskeskyen.dk, a Danish wishlist service).
On toolbar click it opens Ønskeskyen's own public quick-add page in a popup:
https://onskeskyen.dk/da/quick-add?crawlerTarget=<current tab URL>
The only data transmitted is that URL, only on click (declared browsingActivity,
implicit consent). No storage, no remote code, no build step; source is as uploaded.
Content script on onskeskyen.dk quick-add only listens for the page's own
postMessage("onClose") and asks the background to close the popup.
Test: open any product page (e.g. elgiganten.dk), click the button. Without an
Ønskeskyen account you'll see its login page, which is expected.
Source: https://github.com/hearmyego/onskeskyen-wishdrop
```

**Updates:** bump `version` (manifest + package.json), then either:

- AMO → My Add-ons → Wishdrop → **Upload New Version** (must be on the existing add-on, else AMO treats it as new), or
- API: Developer Hub → Tools → Manage API Keys, then `WEB_EXT_API_KEY=… WEB_EXT_API_SECRET=… vpr release`

**Rules:**

- Gecko ID `wishdrop@hearmyego.github.io` is permanent.
- Never commit API keys.
- Data use changes → update manifest `data_collection_permissions` + `PRIVACY.md` + listing.

## Install

- **Temporary:** `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → `src/manifest.json`. Gone on restart.
- **Permanent:** release Firefox needs signing. AMO "unlisted" via `web-ext sign`. Dev Edition/Nightly/ESR: `xpinstall.signatures.required = false`.

## License

[MIT](LICENSE)
