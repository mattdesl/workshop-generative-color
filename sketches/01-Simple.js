// Exercise: Work with 3 LCH colors keyed to different axes

// Picker:
// https://lch.oklch.com/

import { Color, colorToStyle } from "../lib/color.js";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d", {
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const width = 256;
const height = 256;
canvas.width = width;
canvas.height = height;

let color;

// LCH Color Range:
// L = 0 .. 100    (Lightness)
// C = 0 .. 150  (Chroma)
// H = 0 .. 360  (Hue)

//oklch(90.59% 0.205 105.16)

color = new Color("oklch", [0.9059, 0.205, 105.16]);
context.fillStyle = colorToStyle(color);
context.fillRect(0, 0, width / 2, height);

color = new Color("lch", [50, 50, 40]);
context.fillStyle = colorToStyle(color);
context.fillRect(width / 2, 0, width / 2, height / 2);

color = new Color("lch", [80, 50, 40]);
context.fillStyle = colorToStyle(color);
context.fillRect(width / 2, height / 2, width / 2, height / 2);

document.body.appendChild(canvas);
