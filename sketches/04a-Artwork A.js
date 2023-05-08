// Exercise: Apply a procedural palette to an artwork
import { Color, colorToStyle } from "../lib/color.js";
import * as random from "../lib/random.js";
import { createCanvas } from "../lib/util.js";
import { okhsl_to_srgb } from "../lib/oklab.js";

// choose a fixed background
const background = new Color("lch", [90, 5, 60]);

const baseHue = Array(3)
  .fill()
  .map(() => [random.range(0, 1), random.range(0, 100)]);

const procColor = () => {
  // 0..1 for all HSL/HSV coords
  const h = random.weightedSet(baseHue);
  const s = random.range(0.95, 1);
  const l = random.weightedSet([
    [0.2, 10],
    [0.98, 10],
    [random.range(0.5, 0.9), 80],
  ]);

  const srgb = okhsl_to_srgb(h, s, l).map((x) => x / 0xff);
  return new Color("srgb", srgb);
};

const count = 100;
const { canvas, context, width, height } = createCanvas();

context.fillStyle = colorToStyle(background);
context.fillRect(0, 0, width, height);

// Draw N dots
const margin = width * 0.2;
for (let i = 0; i < count; i++) {
  context.beginPath();
  const r = width * 0.03;
  context.arc(
    random.range(margin, width - margin),
    random.range(margin, height - margin),
    r,
    0,
    Math.PI * 2
  );
  context.fillStyle = colorToStyle(procColor());
  context.fill();
}

document.body.appendChild(canvas);
