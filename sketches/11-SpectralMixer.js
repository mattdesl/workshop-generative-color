// Exercise: Use color science to process images

// import Color from "https://colorjs.io/dist/color.js";
// import { imagePixels } from "../lib/test.js";

import * as random from "../lib/random.js";
import { lerpArray, mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";
import * as spectra from "../lib/spectra/spectra.js";
import ColorChecker from "../lib/spectra/colorchecker.js";
import { Color, colorToStyle } from "../lib/color.js";

const width = 1024;
const height = 512;

const { canvas, context } = createCanvas({
  width,
  height,
});

random.setSeed("" || random.getRandomHash());
console.log(random.getSeed());

const [A, B] = random.shuffle(ColorChecker);

// a good example
// const [A, B] = [ColorChecker[12], ColorChecker[15]];

const a = A.spd;
const b = B.spd;

const lRGB0 = spectra.XYZ_to_linearRGB(spectra.spectra_to_XYZ(a));
const lRGB1 = spectra.XYZ_to_linearRGB(spectra.spectra_to_XYZ(b));
const rgb0 = spectra.linearRGB_to_sRGB(lRGB0);
const rgb1 = spectra.linearRGB_to_sRGB(lRGB1);

const steps = 12;
for (let i = 0; i < steps; i++) {
  const sliceWidth = Math.round((1 / steps) * width);
  const u = i / (steps - 1);
  const c = spectra.mix_spectra(a, b, u);

  let outColor = spectra.spectra_to_sRGB(c);
  context.fillStyle = context.strokeStyle = `rgb(${outColor.join(",")})`;
  context.fillRect(sliceWidth * i, 0, sliceWidth, height / 2);

  outColor = spectra.linearRGB_to_sRGB(lerpArray(lRGB0, lRGB1, u));
  context.fillStyle = context.strokeStyle = `rgb(${outColor.join(",")})`;
  context.fillRect(sliceWidth * i, (1 * height) / 2, sliceWidth, height / 2);
}

document.body.appendChild(canvas);
