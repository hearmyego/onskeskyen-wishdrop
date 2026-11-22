import { describe, expect, test } from "vite-plus/test";
import { buildQuickAddUrl, isAddable, isQuickAddPage, popupBounds } from "../src/background.js";

describe("buildQuickAddUrl", () => {
  test("builds quick-add URL with encoded crawlerTarget", () => {
    const product = "https://www.example.com/p/sko?size=42&color=røde";
    const out = new URL(buildQuickAddUrl(product));
    expect(out.origin + out.pathname).toBe("https://onskeskyen.dk/da/quick-add");
    expect(out.searchParams.get("crawlerTarget")).toBe(product);
  });
});

describe("isAddable", () => {
  test.each([
    ["https://www.elgiganten.dk/product/123", true],
    ["about:newtab", false],
    ["moz-extension://abc/page.html", false],
    ["https://onskeskyen.dk/da/quick-add", false],
    ["https://gowish.com/en", false],
    ["not a url", false],
  ])("%s -> %s", (url, expected) => {
    expect(isAddable(url)).toBe(expected);
  });
});

describe("isQuickAddPage", () => {
  test.each([
    ["https://onskeskyen.dk/da/quick-add?crawlerTarget=x", true],
    ["https://onskeskyen.dk/quick-add", true],
    ["https://onskeskyen.dk/da/wishlist/123", false],
    ["https://evil.example/da/quick-add", false],
    [undefined, false],
  ])("%s -> %s", (url, expected) => {
    expect(isQuickAddPage(url)).toBe(expected);
  });
});

describe("popupBounds", () => {
  test("centres the popup over the parent window", () => {
    expect(popupBounds({ left: 100, top: 50, width: 1480, height: 960 })).toEqual({
      width: 480,
      height: 760,
      left: 600,
      top: 150,
    });
  });

  test("never goes off-screen when the parent is smaller than the popup", () => {
    expect(popupBounds({ left: 0, top: 0, width: 400, height: 500 })).toMatchObject({
      left: 0,
      top: 0,
    });
  });

  test("falls back gracefully without parent geometry", () => {
    expect(popupBounds(undefined)).toMatchObject({ left: 0, top: 0 });
  });
});
