<p align="center"><img src="src/icons/icon-128.png" width="96" alt="Wishdrop"></p>

<h1 align="center">Wishdrop for Ønskeskyen</h1>

<p align="center"><b>See it. Click it. Wished.</b><br>
Add any product from any webshop to your Ønskeskyen wishlist with one click in Firefox.</p>

---

## Why

You find the perfect gift idea on some webshop. Then you copy the link, open Ønskeskyen, find "add wish", paste it,
pick a list and switch back to the shop. Every time.

**Wishdrop does it in one click.** Hit the cloud in your toolbar, choose a wishlist in the small window that pops up,
and you're back on the page you were looking at.

- **One click** from any product page, in any shop
- **Stays out of your way**: a small popup, not a new tab, and it closes itself when the wish is saved
- **Uses your existing Ønskeskyen login**, so there's no extra account and nothing to set up
- **Private by design**: no tracking, no storage, no background activity

## Privacy

Only when you click, the extension sends the address of the current page to Ønskeskyen so it can find the
product. Nothing goes to anyone else, nothing is stored, and nothing runs in the background. Details:
[PRIVACY.md](PRIVACY.md).

## Install

Coming soon to Firefox Add-ons. Until then, see [Development](#development) to run it locally.

Works in Firefox and Firefox-based browsers on desktop. Supports [onskeskyen.dk](https://onskeskyen.dk).

## How it works

Clicking the button opens Ønskeskyen's own quick-add page in a popup with the current page as the product:
`https://onskeskyen.dk/da/quick-add?crawlerTarget=<page URL>`. When Ønskeskyen reports the wish as saved, a tiny
content script closes the popup. It's about 100 lines of plain JavaScript with no build step.

## Development

**Prerequisites**

- [Firefox](https://www.mozilla.org/firefox/) (desktop)
- [Node.js](https://nodejs.org) 22.18+ or 24.11+
- [Vite+](https://viteplus.dev) (`vp`), which installs the pinned pnpm for you
- An [Ønskeskyen](https://onskeskyen.dk) account for testing

**Run**

```sh
git clone https://github.com/hearmyego/onskeskyen-wishdrop.git
cd onskeskyen-wishdrop
vp install   # dependencies + pre-commit hook
vpr dev      # opens Firefox with the extension loaded, live reload
```

Firefox opens with a fresh profile, so log in to Ønskeskyen there and then click the cloud on any product page.

**Other commands**

```sh
vpr test       # unit tests
vpr validate   # format, lint, types + Mozilla add-on lint
vpr build      # packaged zip in dist/
```

**Project layout**

```
src/manifest.json        extension manifest (MV3)
src/background.js        toolbar click → popup, closes it when done
src/quick-add-close.js   listens for Ønskeskyen's "done" signal
test/                    unit tests
```

Contributions are welcome. Open an [issue](https://github.com/hearmyego/onskeskyen-wishdrop/issues) or a PR.

## Disclaimer

Unofficial. Not affiliated with or endorsed by Ønskeskyen / GoWish. All trademarks belong to their owners.

## License

[MIT](LICENSE)
