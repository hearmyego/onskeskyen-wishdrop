// Runs on Ønskeskyen's quick-add page.
//
// The page is built to live inside a shop's iframe. When the wish is saved
// (or the user hits its close button), it calls
// `window.top.postMessage("onClose", "*")`. In our popup window, `window.top`
// is the page itself, so we can hear that message and ask the background
// script to close the popup.
window.addEventListener("message", (event) => {
  if (event.origin !== location.origin || event.data !== "onClose") return;
  browser.runtime.sendMessage({ type: "close-quick-add" });
});
