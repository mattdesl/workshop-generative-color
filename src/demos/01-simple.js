// Exercise: Work with 3 LCH colors keyed to different axes

import Color from "https://colorjs.io/dist/color.js";

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

color = new Color("lch", [100, 150, 40]);
context.fillStyle = color.toString();
context.fillRect(0, 0, width / 2, height);

color = new Color("lch", [100, 100, 40]);
context.fillStyle = color.toString();
context.fillRect(width / 2, 0, width / 2, height / 2);

color = new Color("lch", [100, 50, 40]);
context.fillStyle = color.toString();
context.fillRect(width / 2, height / 2, width / 2, height / 2);

document.body.appendChild(canvas);
