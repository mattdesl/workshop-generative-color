// Exercise: Use color science to process images

// import Color from "https://colorjs.io/dist/color.js";
// import { imagePixels } from "../lib/test.js";

import * as random from "../lib/random.js";
import { clamp01, mapRange, lerp } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";
import {
  illuminant_d65,
  spectra_to_sRGB,
  spectra_to_XYZ,
  sRGB_to_spectra,
  WAVELENGTH_COUNT,
  WAVELENGTH_MAX,
  WAVELENGTH_MIN,
  wavelength_to_sRGB,
  wavelength_to_XYZ,
  XYZ_to_sRGB,
} from "../lib/spectra/spectra.js";
import macbeth from "../lib/spectra/macbeth.js";

const width = 1024;
const height = 256;

const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const steps = width;
for (let i = 0; i < steps; i++) {
  const u = i / (steps - 1);
  const outColor = wavelength_to_sRGB(lerp(400, 700, u));
  context.fillStyle = context.strokeStyle = `rgb(${outColor.join(",")})`;
  const sliceWidth = Math.round((1 / steps) * width);
  context.fillRect(sliceWidth * i, 0, sliceWidth, height);
}

document.body.appendChild(canvas);
