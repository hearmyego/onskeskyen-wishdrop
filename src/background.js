// Wishdrop for Ønskeskyen
//
// On toolbar click: open Ønskeskyen's own quick-add page in a small popup
// window (like a "Sign in with Google" window), centred over the browser, with
// the current tab's URL as `crawlerTarget`. Ønskeskyen scrapes the product and lets the user pick
// a wishlist. Login is handled by the user's existing onskeskyen.dk session.
//
// When Ønskeskyen signals the wish is saved, the content script
// (quick-add-close.js) asks us to close the popup again.
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

export const POPUP_SIZE = { width: 480, height: 760 };

// Centre the popup over the browser window it was opened from.
export function popupBounds(parent, size = POPUP_SIZE) {
  const { left = 0, top = 0, width = size.width, height = size.height } = parent ?? {};
  return {
    width: size.width,
    height: size.height,
    left: Math.max(0, Math.round(left + (width - size.width) / 2)),
    top: Math.max(0, Math.round(top + (height - size.height) / 2)),
  };
}

// Guard so the module can be imported in Node tests without `browser`.
if (typeof browser !== "undefined") {
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab?.url || !isAddable(tab.url)) return;
    const parent = await browser.windows.get(tab.windowId);
    await browser.windows.create({
      type: "popup",
      url: buildQuickAddUrl(tab.url),
      ...popupBounds(parent),
    });
  });

  browser.runtime.onMessage.addListener((message, sender) => {
    if (message?.type !== "close-quick-add") return;
    if (!sender.tab?.id || !isQuickAddPage(sender.url)) return;
    // The popup has a single tab, so removing it closes the window and focus
    // returns to the browser window behind it.
    return browser.tabs.remove(sender.tab.id);
  });
}
