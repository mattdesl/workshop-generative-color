import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { lerp, lerpArray, mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";

const width = 512;
const height = 512;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const hue = random.range(0, 360);
const chroma = random.range(0, 0.37);
const light = random.range(0, 1);

const col = new Color("oklch", [light, chroma, hue]);
context.fillStyle = colorToStyle(col);
context.fillRect(0, 0, width, height);

const c1 = col.contrast("black", "wcag21");
const c2 = col.contrast("white", "wcag21");
const foreground = c1 > c2 ? "black" : "white";

const margin = 0.1 * width;

for (let i = 0; i < 40; i++) {
  context.strokeStyle = context.fillStyle = foreground;
  context.beginPath();
  const x = random.range(margin, width - margin);
  const y = random.range(margin, height - margin);
  const r = width * 0.05;
  const angle = random.range(0, Math.PI * 2);
  context.lineTo(x - Math.cos(angle) * r, y - Math.sin(angle) * r);
  context.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  context.lineWidth = width * 0.01;
  context.lineJoin = "round";
  context.stroke();
}

document.body.appendChild(canvas);
