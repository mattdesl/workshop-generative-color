import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";

const width = 256;
const height = 128;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const palette = [];

const hue = random.range(0, 360);

const hueOffset = 180;
const light = 0.5;
const chroma = 0.3;

palette.push(new Color("oklch", [light, chroma, hue]));
palette.push(new Color("oklch", [light + 0.2, chroma, hue]));
palette.push(new Color("oklch", [light + 0.4, chroma, hue]));

palette.push(new Color("oklch", [light + 0.4, chroma, hue + hueOffset]));
palette.push(new Color("oklch", [light + 0.2, chroma, hue + hueOffset]));
palette.push(new Color("oklch", [light, chroma, hue + hueOffset]));

for (let x = 0; x < palette.length; x++) {
  const color = palette[x];
  const tileWidth = Math.ceil(width / palette.length);
  context.fillStyle = colorToStyle(color);
  context.fillRect(x * tileWidth, 0, tileWidth, height);
}

document.body.appendChild(canvas);
