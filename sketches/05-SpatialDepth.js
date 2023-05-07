// Exercise: Create a pair-generator that is harmonious

import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { createCanvas } from "../lib/util.js";

random.setSeed("" || random.getRandomHash());

const aspect = 1.414;
const width = 1024;
const height = 1024 * aspect;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

// select one primary hue and offset it
const baseHue = random.range(0, 360);
const hues = [baseHue, baseHue + 90];

function procColor() {
  // 20% chance of extremely white tint
  const lOffset = random.chance(0.2) ? 0.5 : 0;
  const l = lOffset + random.range(0.2, 0.8);
  const c = random.range(0.1, 0.3);
  const h = random.pick(hues);
  return new Color("oklch", [l, c, h]);
}

function procBackground() {
  const l = random.range(0.9, 0.95);
  const c = random.range(0, 0.026);
  const h = random.range(0, 105);
  return new Color("oklch", [l, c, h]);
}

const count = 100;
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

const background = procBackground();
context.fillStyle = colorToStyle(background);
context.fillRect(0, 0, width, height);

// sort by luminance
shapes.sort((a, b) => a.color.oklch.l - b.color.oklch.l);

context.transform(1, 0.2, 0.0, 1, 0, -height * 0.05);
shapes.forEach((shape) => {
  context.fillStyle = context.strokeStyle = colorToStyle(shape.color);
  context.lineJoin = "round";
  context.lineWidth = width * 0.02;
  context.fillRect(shape.x, shape.y, shape.width, shape.height);
  context.strokeRect(shape.x, shape.y, shape.width, shape.height);
});

document.body.appendChild(canvas);
