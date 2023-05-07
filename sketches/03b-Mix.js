// Exercise: Devise a simple random palette generator

import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { lerp, lerpArray, mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";

const width = 256;
const height = 128;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const procColor = () => {
  return new Color("oklch", [
    random.range(0.5, 0.8),
    random.range(0.1, 0.2),
    random.range(0, 360),
  ]);
};

const colorA = procColor();

// rotate its hue and lightness
const colorB = colorA.clone();
colorB.oklch.h += random.range(45, 180);
colorB.oklch.l += random.range(-0.2, 0.2);

const columns = 16;
for (let x = 0; x < columns; x++) {
  // get U coordinates between 0..1 for the X axis
  const u = columns <= 1 ? 0.5 : x / (columns - 1);

  const color = colorA.clone();

  // interpolate in linear space
  // color.srgb_linear = lerpArray(colorA.srgb_linear, colorB.srgb_linear, u);

  // or in LAB
  color.lab = lerpArray(colorA.lab, colorB.lab, u);

  const tileWidth = Math.ceil(width / columns);
  context.fillStyle = colorToStyle(color);
  context.fillRect(x * tileWidth, 0, tileWidth, height);
}

document.body.appendChild(canvas);
