import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQuickAddUrl, isAddable } from "../src/background.js";

test("builds quick-add URL with encoded crawlerTarget", () => {
  const product = "https://www.example.com/p/sko?size=42&color=røde";
  const out = new URL(buildQuickAddUrl(product));
  assert.equal(out.origin + out.pathname, "https://onskeskyen.no/quick-add");
  assert.equal(out.searchParams.get("crawlerTarget"), product);
});

test("only http(s) non-Ønskeskyen pages are addable", () => {
  assert.equal(isAddable("https://www.elkjop.no/product/123"), true);
  assert.equal(isAddable("about:newtab"), false);
  assert.equal(isAddable("moz-extension://abc/page.html"), false);
  assert.equal(isAddable("https://onskeskyen.no/quick-add"), false);
  assert.equal(isAddable("https://gowish.com/en"), false);
  assert.equal(isAddable("not a url"), false);
});
