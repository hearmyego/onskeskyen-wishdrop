# zen-plug — Ønskeskyen Quick Add

A Zen Browser extension (works in Zen and Firefox). Click the toolbar button on any product page and it opens
Ønskeskyen's quick-add page for that product:

```
https://onskeskyen.no/quick-add?crawlerTarget=<encoded product URL>
```

Ønskeskyen reads the product details itself and lets you pick a wishlist. If you aren't logged in on onskeskyen.no,
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

```sh
npm install
npm start        # launches Zen with the extension loaded temporarily (live reload)
npm test         # unit tests
npm run lint     # web-ext lint
npm run build    # zip -> dist/
```

`npm start` uses `/Applications/Zen.app/Contents/MacOS/zen`. You can override it with `ZEN_BIN=/path/to/zen npm start`.

### Loading manually
Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…**, and select `src/manifest.json`.

### Installing permanently
Zen, like release Firefox, only installs signed extensions permanently. Sign the extension through
[addons.mozilla.org](https://addons.mozilla.org/developers/) as "unlisted" (`web-ext sign`). Or set
`xpinstall.signatures.required = false` in `about:config` if your Zen build allows it.
