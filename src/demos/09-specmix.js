// Exercise: Use color science to process images

// import Color from "https://colorjs.io/dist/color.js";
// import { imagePixels } from "../lib/test.js";

import * as random from "../lib/random.js";
import { lerpArray, mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";
import * as spectra from "../lib/spectra/spectra.js";
import { xyz2rgb, rgb2xyz } from "../lib/spectra/xyz.js";
import macbeth from "../lib/spectra/macbeth.js";
import { mix as spectralJSMix } from "../lib/spectral.js";

const width = 1024;
const height = 1024;

const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

random.setSeed("" || random.getRandomHash());
console.log(random.getSeed());

// console.log(random.rangeFloor(0, macbeth.length));
// console.log(random.rangeFloor(0, macbeth.length));
const [a, b] = random.shuffle(macbeth);

// a good example
// const [a, b] = [macbeth[12], macbeth[15]];

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
