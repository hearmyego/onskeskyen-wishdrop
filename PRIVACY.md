# Privacy policy: Wishdrop for Ønskeskyen

_Last updated: 2026-11-22_

Wishdrop is an unofficial browser extension. It is not affiliated with Ønskeskyen / GoWish.

## What is transmitted

- **Only when you click the Wishdrop button**, the extension sends the URL of the page you are viewing to
  Ønskeskyen. It does this by opening `https://onskeskyen.dk/da/quick-add?crawlerTarget=<page URL>` in a popup window.
- Ønskeskyen uses the URL to look up the product and add it to your wishlist. From then on, Ønskeskyen's own privacy
  policy applies: <https://onskeskyen.dk>.

## What is not collected

- No data is sent to the extension author or any other party.
- No browsing history, page content, cookies, account data, analytics or identifiers.
- Nothing is sent in the background or without a click.

## Storage

The extension stores nothing: no `storage` API, cookies or local files.

## Permissions

- `activeTab`: read the current tab's URL, only at the moment you click the button.
- Content script on `onskeskyen.dk/*quick-add*`: listens for Ønskeskyen's "done" signal and closes the popup. It reads
  and sends nothing.

## Contact

<https://github.com/hearmyego/onskeskyen-wishdrop/issues>
