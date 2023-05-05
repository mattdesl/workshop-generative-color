// Exercise: Use color science to process images

import * as random from "../lib/random.js";
import { createCanvas } from "../lib/util.js";
import { spectra_to_sRGB } from "../lib/spectra/spectra.js";

import macbeth from "../lib/spectra/macbeth.js";

const width = 512;
const height = 256;

const { canvas, context } = createCanvas({
  width,
  height,
});

const spec = random.pick(macbeth);

const outColor = spectra_to_sRGB(spec);
context.fillStyle = context.strokeStyle = `rgb(${outColor.join(",")})`;
context.fillRect(0, 0, width, height);

context.beginPath();
spec.forEach((x, i) =>
  context.lineTo((i / (spec.length - 1)) * width, height - height * x)
);
context.strokeStyle = "white";
context.stroke();

document.body.appendChild(canvas);
