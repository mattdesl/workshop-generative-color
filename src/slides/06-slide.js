// Exercise: Devise a simple random palette generator

import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";

const width = 1920;
const height = 1080;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const hue = 0;

let columns = 16;
for (let x = 0; x < columns; x++) {
  // get U coordinates between 0..1 for the X axis
  const u = columns <= 1 ? 0.5 : x / (columns - 1);

  // Construct procedural palette

  const color = new Color("oklch", [0.75, 0.4, 0]);
  color.hsl.s = u * 100;
  // const color = new Color("oklch", [0.65, 0.4, 0]);
  const tileWidth = Math.ceil(width / columns);
  context.fillStyle = colorToStyle(color);
  context.fillRect(x * tileWidth, 0, tileWidth, height);
}

document.body.appendChild(canvas);
