// Exercise: Use color science to process images

// import Color from "https://colorjs.io/dist/color.js";
// import { imagePixels } from "../lib/test.js";

import { createCanvas } from "../lib/util.js";
import { wavelength_to_sRGB } from "../lib/spectra/spectra.js";
import { lerp } from "../lib/math.js";

const width = 1024;
const height = 256;

const { canvas, context } = createCanvas({
  width,
  height,
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
