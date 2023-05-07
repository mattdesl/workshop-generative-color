import { colorToStyle } from "../color.js";
import { createCanvas } from "../util.js";
import * as random from "../random.js";

export default function visualize(opts = {}) {
  const {
    size = 1024,
    tiles = 4,
    margin = size * 0.1,
    tilePadding = (size * 0.1) / 2,
    background,
    palette,
  } = opts;
  const width = size;
  const height = size;
  const { canvas, context } = createCanvas({
    width,
    height,
    // Tip: Uncomment to use P3 colors
    // colorSpace: "display-p3",
  });
  // draw background
  context.fillStyle = colorToStyle(background);
  context.fillRect(0, 0, width, height);

  // draw artwork
  const innerSize = width - margin * 2;
  const columns = tiles;
  const rows = columns;
  let tileSize = (innerSize - tilePadding * (columns - 1)) / columns;
  for (let row = 0, index = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++, index++) {
      const tx = margin + column * (tileSize + tilePadding);
      const ty = margin + row * (tileSize + tilePadding);
      draw(palette, tx, ty, tileSize, tileSize);
    }
  }

  function draw(palette, x, y, w, h) {
    // the coordinates are in a normalized 0..1 space
    const u = random.range(0, 1);
    const v = random.range(0, 1);
    const point = [u, v];
    const corners = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];

    const curColors = random.shuffle(palette);
    for (let i = 0; i < 4; i++) {
      const color = curColors[i % curColors.length];
      const corner0 = corners[i % corners.length];
      const corner1 = corners[(i + 1) % corners.length];
      const path = [point, corner0, corner1];

      context.lineJoin = "round";
      context.beginPath();
      context.fillStyle = colorToStyle(color);
      // draw, mapping the 0..1 to pixel space
      path.forEach((p) => context.lineTo(x + p[0] * w, y + p[1] * h));
      context.fill();
    }
  }

  return canvas;
}
