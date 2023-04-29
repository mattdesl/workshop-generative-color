// Exercise: Use color science to process images

// import Color from "https://colorjs.io/dist/color.js";
// import { imagePixels } from "../lib/test.js";

import * as random from "../lib/random.js";
import { mapRange } from "../lib/math.js";
import { createCanvas } from "../lib/util.js";
import * as spectra from "../lib/spectra/spectra.js";
import { xyz2rgb, rgb2xyz } from "../lib/spectra/xyz.js";
import macbeth from "../lib/spectra/macbeth.js";

const width = 256;
const cols = 6;
const rows = 4;
const tileWidth = width / cols;
const tileHeight = tileWidth;
const height = rows * tileHeight;

const { canvas, context } = createCanvas({
  width,
  height,
  // Tip: Uncomment to use P3 colors
  // colorSpace: "display-p3",
});

const data = macbeth;
const expected = spectra.ColorChecker;
for (let i = 0; i < data.length; i++) {
  const spec = data[i];
  const xyz_d65 = spectra.spectra_to_XYZ(spec, spectra.illuminant_d65);
  const xyz_c = spectra.spectra_to_XYZ(spec, spectra.illuminant_c);
  const cie_xyY = spectra.xyz_to_xyY(xyz_c);
  console.log(
    "data",
    cie_xyY.map((x) => parseFloat(x.toFixed(3))),
    expected
  );

  const rgb = spectra.XYZ_to_sRGB(xyz_d65);
  const x = Math.floor(i % cols);
  const y = Math.floor(i / cols);

  context.fillStyle = `rgb(${rgb.join(",")})`;
  context.fillRect(
    x * tileWidth,
    y * tileHeight,
    tileWidth,
    Math.ceil(tileHeight / 2)
  );
  context.fillStyle = expected[i][1];
  context.fillRect(
    x * tileWidth,
    y * tileHeight + Math.floor(tileHeight / 2),
    tileWidth,
    Math.ceil(tileHeight / 2)
  );
}

document.body.appendChild(canvas);
