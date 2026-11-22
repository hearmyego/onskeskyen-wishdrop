# zen-plug — Ønskeskyen Quick Add

A Zen Browser extension (works in Zen and Firefox). Click the toolbar button on any product page and it opens
Ønskeskyen's quick-add page for that product:

```
https://onskeskyen.dk/da/quick-add?crawlerTarget=<encoded product URL>
```

Ønskeskyen reads the product details itself and lets you pick a wishlist. If you aren't logged in on onskeskyen.dk,
it asks you to log in.

**No data stored.** The extension has no storage, no content scripts and no host permissions. It only uses
`activeTab` to read the current tab's URL when you click the button.

## Layout

```
src/
  manifest.json     MV3 manifest (Gecko)
  background.js     click handler + URL builder
  icons/icon.svg
test/               node:test unit tests
```

## Development

Uses [Vite+](https://viteplus.dev) (`vp`) for install, tests, lint, format and type checks. `web-ext` handles running and packaging the extension.

The package manager is **pnpm**, pinned via `devEngines.packageManager` in `package.json`. `vp` picks the right version
automatically. Vite+ dependency aliasing lives in `pnpm-workspace.yaml`. Don't use npm/yarn. Commit `pnpm-lock.yaml`.

```sh
vp install       # install deps (also sets up the pre-commit hook)
vpr dev          # launch Zen with the extension loaded (live reload)
vp test          # unit tests (watch mode); `vpr test` runs once
vp check         # format + lint + type check (`vp check --fix` to autofix)
vpr validate     # vp check + web-ext lint of the manifest
vpr build        # zip -> dist/
```

`vpr dev` uses `/Applications/Zen.app/Contents/MacOS/zen`. You can override it with `ZEN_BIN=/path/to/zen vpr dev`.

The pre-commit hook runs `vp check --fix` on staged files.

## Testing the plugin

### 1. Automated tests

```sh
vpr test
vpr validate
```

The unit tests cover how the quick-add URL is built and which pages are addable. `validate` checks the manifest
against Mozilla's add-on linter.

### 2. Manual test in Zen

1. Log in at <https://onskeskyen.dk> in Zen. With `vpr dev`, log in inside the browser window it opens, because
   `web-ext` uses a fresh, temporary profile.
2. Start the extension, either with `vpr dev` or by loading it manually (see below).
3. Pin the button if needed: open the extensions menu (puzzle icon) and pin **Ønskeskyen Quick Add**.
4. Open a product page, e.g. any product on elgiganten.dk, proshop.dk or zalando.dk.
5. Click the button and check that:
   - a new tab opens to the right with `https://onskeskyen.dk/da/quick-add?crawlerTarget=<product URL>`
   - Ønskeskyen shows the product's title, image and price
   - you can pick a wishlist and the wish appears in your account
6. Negative checks: clicking on `about:newtab`, an `about:` page or an onskeskyen.dk page does nothing.
7. Debug: in `about:debugging#/runtime/this-firefox`, click **Inspect** on the extension to see the background
   console.

### Loading manually

Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…**, and select `src/manifest.json`.
The extension stays loaded until Zen restarts.

### Installing permanently

Zen, like release Firefox, only installs signed extensions permanently. Sign the extension through
[addons.mozilla.org](https://addons.mozilla.org/developers/) as "unlisted" (`web-ext sign`). Or set
`xpinstall.signatures.required = false` in `about:config` if your Zen build allows it.
