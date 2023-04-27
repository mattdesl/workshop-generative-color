// Exercise: Create a pair-generator that is harmonious

import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { createCanvas } from "../lib/util.js";

const width = 1024;
const height = 768;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const LCH = [
  0.85, // lightness
  0.3, // chroma
  100, // hue
];

// create two colors
const color = new Color("oklch", LCH);
const colorA = color.clone();
const colorB = color.clone();

const offset = 0.03;
const axis = 0;
colorA.coords[axis] += offset;
colorB.coords[axis] -= offset;

context.fillStyle = "hsl(0, 5%, 95%)";
context.fillRect(0, 0, width, height);

// draw the two swatches with a little padding
const margin = width * 0.1;
context.fillStyle = colorToStyle(colorA);
context.fillRect(margin, margin, width / 2, height - margin * 2);

context.fillStyle = colorToStyle(colorB);
context.fillRect(width / 2, margin, width / 2 - margin, height - margin * 2);

context.fillStyle = colorToStyle(color);
const size = width / 6;
context.fillRect(width / 2 - size / 2, height / 2 - size / 2, size, size);

document.body.appendChild(canvas);
