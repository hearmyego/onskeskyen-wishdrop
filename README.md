# Wishdrop for Ønskeskyen

`onskeskyen-wishdrop` is a Firefox extension. It also works in Firefox-based browsers.
Click the toolbar button on any product page and it opens Ønskeskyen's quick-add page for that product:

```
https://onskeskyen.dk/da/quick-add?crawlerTarget=<encoded product URL>
```

Ønskeskyen reads the product details itself and lets you pick a wishlist. If you aren't logged in on onskeskyen.dk,
it asks you to log in. The page opens in a small popup window centred over the browser, like a "Sign in with Google" window. When the
wish is saved, the popup closes and you're back on the product page.

The button is placed directly in the toolbar (`action.default_area: "navbar"`), so you don't have to open the
extensions menu to find it.

**No data stored.** The extension has no storage and collects nothing. It uses:

- `activeTab` to read the current tab's URL when you click the button.
- a small content script on `onskeskyen.dk/*quick-add*` that listens for the page's "done" signal (see below) and
  closes the popup.

## How the quick-add page works

These details come from reading Ønskeskyen's frontend bundle (`pages/quick-add-*.js`). Nothing here is a documented
API, so it can change without notice.

| Query param      | Used for                                                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crawlerTarget`  | **The product URL.** Ønskeskyen scrapes title, images, price and currency from it on its servers. This is the only param that changes what gets added.                                                   |
| `metadataSource` | Analytics tag for where the wish came from. Defaults to `PartnerWishButton`. Other values (`CrawledUrl`, `Other`, ...) only change tracking. `ProductSearch` also reads `sourceId` from the product URL. |
| `source`         | Passed to the wishlist picker as a tracking source.                                                                                                                                                      |

There are no params for title, price, image, note or target wishlist. You set those in the form. If you aren't logged
in, the page redirects to `/login?origin=quickadd&redirect=/quick-add?crawlerTarget=...` and comes back afterwards.

**Closing:** the page was built to run inside a shop's iframe ("wish button"). It calls
`window.top.postMessage("onClose", "*")` 700 ms after a wish is saved, and also when you click its ✕ button. In our popup window
that message goes to the page itself. `src/quick-add-close.js` listens for it, and the background script closes the popup.

## Development

Uses [Vite+](https://viteplus.dev) (`vp`) for install, tests, lint, format and type checks. `web-ext` handles running and packaging the extension.

The package manager is **pnpm**, pinned via `devEngines.packageManager` in `package.json`. `vp` picks the right version
automatically. Vite+ dependency aliasing lives in `pnpm-workspace.yaml`. Don't use npm/yarn. Commit `pnpm-lock.yaml`.

```sh
vp install       # install deps (also sets up the pre-commit hook)
vpr dev          # launch Firefox with the extension loaded (live reload)
vp test          # unit tests (watch mode); `vpr test` runs once
vp check         # format + lint + type check (`vp check --fix` to autofix)
vpr validate     # vp check + web-ext lint of the manifest
vpr build        # zip -> dist/
```

`vpr dev` finds your installed Firefox automatically. To use another Firefox build, such as Developer Edition or Nightly,
set `WEB_EXT_FIREFOX`, e.g. `WEB_EXT_FIREFOX=nightly vpr dev` or `WEB_EXT_FIREFOX=/path/to/firefox vpr dev`.

The pre-commit hook runs `vp check --fix` on staged files.

## Testing the plugin

### 1. Automated tests

```sh
vpr test
vpr validate
```

The unit tests cover how the quick-add URL is built, which pages are addable, which pages may be closed, and how the popup is centred. `validate` checks the manifest
against Mozilla's add-on linter.

### 2. Manual test in Firefox

1. Log in at <https://onskeskyen.dk> in Firefox. With `vpr dev`, log in inside the browser window it opens, because
   `web-ext` uses a fresh, temporary profile.
2. Start the extension, either with `vpr dev` or by loading it manually (see below).
3. The cloud button appears directly in the toolbar. If you installed an older version where it was unpinned, Firefox
   remembers that choice: remove the extension and add it again, or pin it from the extensions menu.
4. Open a product page, e.g. any product on elgiganten.dk, proshop.dk or zalando.dk.
5. Click the button and check that:
   - a small popup window (480×760) opens centred over the browser, showing
     `https://onskeskyen.dk/da/quick-add?crawlerTarget=<product URL>`
   - Ønskeskyen shows the product's title, image and price
   - you can pick a wishlist and the wish appears in your account
   - about 0.7 s after saving, the popup closes and focus returns to the product page
   - clicking the ✕ in the quick-add form also closes the popup
6. Negative checks: clicking on `about:newtab`, an `about:` page or an onskeskyen.dk page does nothing.
7. Debug: in `about:debugging#/runtime/this-firefox`, click **Inspect** on the extension to see the background
   console.

### Loading manually

Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…**, and select `src/manifest.json`.
The extension stays loaded until Firefox restarts.

### Installing permanently

Release Firefox only installs signed extensions permanently. Sign the extension through
[addons.mozilla.org](https://addons.mozilla.org/developers/) as "unlisted" (`web-ext sign`). Or set
`xpinstall.signatures.required = false` in `about:config` on Firefox Developer Edition, Nightly or ESR. Release Firefox ignores this setting.
