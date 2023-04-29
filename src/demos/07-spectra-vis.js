// Exercise: Use color science to process images

// import Color from "https://colorjs.io/dist/color.js";
// import { imagePixels } from "../lib/test.js";

import * as random from "../lib/random.js";
import { clamp01, inverseLerp, lerp, mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";
import {
  illuminant_d65,
  spectra_to_sRGB,
  sRGB_to_spectra,
  WAVELENGTH_COUNT,
  WAVELENGTH_MAX,
  WAVELENGTH_MIN,
} from "../lib/spectra/spectra.js";

import macbeth from "../lib/spectra/macbeth.js";

const width = 512;
const height = 256;

const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

context.fillStyle = "black";
context.fillRect(0, 0, width, height);

const steps = 20;
const spec = macbeth[5];

for (let i = 0; i < steps; i++) {
  const u = i / (steps - 1);

  const outColor = spectra_to_sRGB(spec);
  context.fillStyle = context.strokeStyle = `rgb(${outColor.join(",")})`;
  const sliceWidth = Math.round((1 / steps) * width);
  context.fillRect(sliceWidth * i, 0, sliceWidth, height);
}

context.beginPath();
spec.forEach((x, i) =>
  context.lineTo((i / (spec.length - 1)) * width, height - height * x)
);
context.strokeStyle = "white";
context.stroke();

document.body.appendChild(canvas);
