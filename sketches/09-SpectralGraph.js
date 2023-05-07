// Exercise: Use color science to process images

import * as random from "../lib/random.js";
import { createCanvas } from "../lib/util.js";
import { spectra_to_sRGB } from "../lib/spectra/spectra.js";
import { Color, colorToStyle } from "../lib/color.js";

import ColorChecker from "../lib/spectra/colorchecker.js";

const width = 512;
const height = 256;

const { canvas, context } = createCanvas({
  width,
  height,
});

const data = random.pick(ColorChecker);
const spd = data.spd;
const outColor = spectra_to_sRGB(spd);
context.fillStyle = context.strokeStyle = `rgb(${outColor.join(",")})`;
context.fillRect(0, 0, width, height);

context.beginPath();
spd.forEach((x, i) =>
  context.lineTo((i / (spd.length - 1)) * width, height - height * x)
);
const foreground =
  new Color(context.fillStyle).contrast("white", "wcag21") < 2
    ? "black"
    : "white";
context.strokeStyle = foreground;
context.lineWidth = 4;
context.stroke();

document.body.appendChild(canvas);
