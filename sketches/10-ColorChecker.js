import { createCanvas } from "../lib/util.js";
import * as spectra from "../lib/spectra/spectra.js";
import ColorChecker from "../lib/spectra/colorchecker.js";

const width = 680;
const cols = 6;
const rows = 4;
const tileWidth = width / cols;
const tileHeight = tileWidth;
const height = rows * tileHeight;

const { canvas, context } = createCanvas({
  width,
  height,
});

for (let i = 0; i < ColorChecker.length; i++) {
  const spd = ColorChecker[i].spd;
  const xyz_d65 = spectra.spectra_to_XYZ(spd, spectra.illuminant_d65);
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
  context.fillStyle = ColorChecker[i].hex;
  context.fillRect(
    x * tileWidth,
    y * tileHeight + Math.floor(tileHeight / 2),
    tileWidth,
    Math.ceil(tileHeight / 2)
  );

  context.fillStyle = "white";
  context.font = "12px monospace";
  context.globalCompositeOperation = "difference";
  context.fillText(
    ColorChecker[i].name,
    x * tileWidth + 10,
    y * tileHeight + 10 + Math.floor(tileHeight / 2)
  );
  context.globalCompositeOperation = "source-over";
}

document.body.appendChild(canvas);
