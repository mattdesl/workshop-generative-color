// Exercise: Devise a simple random palette generator

import Color from "https://colorjs.io/dist/color.js";
import * as random from "../lib/random.js";
import { mapRange } from "../lib/math.js";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d", {
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const width = 256;
const height = 128;
canvas.width = width;
canvas.height = height;

const hue = random.range(0, 360);

let columns = 6;
for (let x = 0; x < columns; x++) {
  // get U coordinates between 0..1 for the X axis
  const u = columns <= 1 ? 0.5 : x / (columns - 1);

  // Construct procedural palette
  const L = mapRange(u, 0, 1, 25, 100);
  const C = mapRange(u, 0, 1, 100, 25);
  const H = hue;

  const color = new Color("lch", [L, C, H]);
  const tileWidth = Math.ceil(width / columns);
  context.fillStyle = color.toString();
  context.fillRect(x * tileWidth, 0, tileWidth, height);
}

document.body.appendChild(canvas);
