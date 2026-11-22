// Render src/icons/icon.svg to PNGs (for the AMO listing and older consumers).
// Run: vpr icons
import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const SIZES = [16, 32, 48, 96, 128];
const svg = readFileSync("src/icons/icon.svg");

for (const size of SIZES) {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(`src/icons/icon-${size}.png`, png);
  console.log(`src/icons/icon-${size}.png`);
}
