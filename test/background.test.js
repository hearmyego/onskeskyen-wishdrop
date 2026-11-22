import { describe, expect, test } from "vite-plus/test";
import { buildQuickAddUrl, isAddable } from "../src/background.js";

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
