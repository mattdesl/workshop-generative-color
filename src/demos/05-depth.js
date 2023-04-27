// Exercise: Create a pair-generator that is harmonious

import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { createCanvas } from "../lib/util.js";

const aspect = 1.414;
const width = 1024;
const height = 1024 * aspect;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

random.setSeed("f9b9cdc357c101f1" || random.getRandomHash());

function procColor() {
  const l = random.range(0, 1);
  const c = random.range(0, 0.4);
  const h = random.range(0, 360);
  return new Color("oklch", [l, c, h]);
}

function procBackground() {
  const l = random.range(0.9, 0.95);
  const c = random.range(0, 0.026);
  const h = random.range(0, 105);
  return new Color("oklch", [l, c, h]);
}

const count = 50;
const margin = 0.2 * width;
const shapes = [];
for (let i = 0; i < count; i++) {
  const w = width * 0.1 * Math.abs(random.gaussian(0, 1));
  const h = width * 0.1 * Math.abs(random.gaussian(0, 1));

  // random point, but then offset by half rect size
  // so they appear centred
  const x = random.range(margin, width - margin) - w / 2;
  const y = random.range(margin, height - margin) - h / 2;

  const color = procColor();
  shapes.push({ color, x, y, width: w, height: h });
}

// sort by luminance
shapes.sort((a, b) => a.color.oklch.l - b.color.oklch.l);

context.fillStyle = colorToStyle(procBackground());
context.fillRect(0, 0, width, height);

context.transform(1, 0.2, 0.0, 1, 0, -height * 0.05);
shapes.forEach((shape) => {
  context.fillStyle = context.strokeStyle = colorToStyle(shape.color);
  context.lineJoin = "round";
  context.lineWidth = width * 0.02;
  context.fillRect(shape.x, shape.y, shape.width, shape.height);
  context.strokeRect(shape.x, shape.y, shape.width, shape.height);
});

document.body.appendChild(canvas);
