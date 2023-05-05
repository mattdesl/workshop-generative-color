// Exercise: Use color science to process images

// import Color from "https://colorjs.io/dist/color.js";
// import { imagePixels } from "../lib/test.js";

import * as random from "../lib/random.js";
import { lerpArray, mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";
import * as spectra from "../lib/spectra/spectra.js";
import { xyz2rgb, rgb2xyz } from "../lib/spectra/xyz.js";
import macbeth from "../lib/spectra/macbeth.js";

const aspect = 1.414;
const width = 1024;
const height = 1024 * aspect;
const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

random.setSeed("" || random.getRandomHash());

// console.log(random.rangeFloor(0, macbeth.length));
// console.log(random.rangeFloor(0, macbeth.length));
const primaries = random.shuffle(macbeth).slice(0, 6);
const bright = macbeth[18];
const dark = macbeth[macbeth.length - 1];

function procPigment() {
  const [a, b] = random.shuffle(primaries);
  let c = spectra.mix_spectra(a, b, random.pick([0, 0.25, 0.5, 0.75, 1]));
  c = spectra.mix_spectra(c, dark, random.range(0, 0.2)); // tint dark
  c = spectra.mix_spectra(c, bright, random.range(0, 1)); // tint bright
  return c;
}

const count = 50;
const margin = 0.225 * width;
const shapes = [];
for (let i = 0; i < count; i++) {
  const w = width * 0.1 * Math.abs(random.gaussian(0, 1));
  const h = width * 0.1 * Math.abs(random.gaussian(0, 1));

  // random point, but then offset by half rect size
  // so they appear centred
  const x = random.range(margin, width - margin) - w / 2;
  const y = random.range(margin, height - margin) - h / 2;

  const pigment = procPigment();
  const Y = spectra.spectra_to_Y(pigment);
  shapes.push({ pigment, Y, x, y, width: w, height: h });
}

// sort by luminance
shapes.sort((a, b) => a.Y - b.Y);

const bgSpec = bright.map((x) => x * 1.04);
const rgb = spectra.spectra_to_sRGB(bgSpec);
const color = `rgb(${rgb.join(",")})`;
context.fillStyle = color;
context.fillRect(0, 0, width, height);

context.transform(1, 0.2, 0.0, 1, 0, -height * 0.05);
shapes.forEach((shape) => {
  const rgb = spectra.spectra_to_sRGB(shape.pigment);
  const color = `rgb(${rgb.join(",")})`;
  context.fillStyle = context.strokeStyle = color;

  context.lineJoin = "round";
  context.lineWidth = width * 0.02;
  context.fillRect(shape.x, shape.y, shape.width, shape.height);
  context.strokeRect(shape.x, shape.y, shape.width, shape.height);
});

document.body.appendChild(canvas);
