// Wishdrop for Ønskeskyen
//
// On toolbar click: open Ønskeskyen's own quick-add page with the current tab's
// URL as `crawlerTarget`. Ønskeskyen scrapes the product and lets the user pick
// a wishlist. Login is handled by the user's existing onskeskyen.dk session.
//
// When Ønskeskyen signals the wish is saved, the content script
// (quick-add-close.js) asks us to close the tab again.
//
// Nothing is stored by this extension.

const QUICK_ADD_URL = "https://onskeskyen.dk/da/quick-add";

export function buildQuickAddUrl(productUrl) {
  const url = new URL(QUICK_ADD_URL);
  url.searchParams.set("crawlerTarget", productUrl);
  return url.toString();
}

export function isAddable(pageUrl) {
  try {
    const { protocol, hostname } = new URL(pageUrl);
    if (protocol !== "http:" && protocol !== "https:") return false;
    // Don't try to add Ønskeskyen / GoWish pages to themselves.
    return !/(^|\.)(onskeskyen\.(no|dk)|gowish\.com)$/.test(hostname);
  } catch {
    return false;
  }
}

export function isQuickAddPage(pageUrl) {
  try {
    const { origin, pathname } = new URL(pageUrl);
    return (
      origin === new URL(QUICK_ADD_URL).origin && /^(\/[a-z]{2})?\/quick-add\/?$/.test(pathname)
    );
  } catch {
    return false;
  }
}

// Guard so the module can be imported in Node tests without `browser`.
if (typeof browser !== "undefined") {
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab?.url || !isAddable(tab.url)) return;
    await browser.tabs.create({
      url: buildQuickAddUrl(tab.url),
      index: tab.index + 1,
      openerTabId: tab.id,
    });
  });

  browser.runtime.onMessage.addListener((message, sender) => {
    if (message?.type !== "close-quick-add") return;
    if (!sender.tab?.id || !isQuickAddPage(sender.url)) return;
    // Firefox returns focus to the opener (product) tab.
    return browser.tabs.remove(sender.tab.id);
  });
}
