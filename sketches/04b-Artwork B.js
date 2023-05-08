// Exercise: Apply a procedural palette to an artwork
import { Color } from "../lib/color.js";
import * as random from "../lib/random.js";
import visualize from "../lib/visualize.js";

// create our color palette
let palette = [];

// choose random hue
const hue = random.range(0, 360);

// add some colors
palette.push("#000");
palette.push("#fff");
palette.push(new Color("lch", [50, 50, hue]));
palette.push(new Color("lch", [20, 150, hue + 45]));

// choose a fixed background
const background = new Color("lch", [90, 5, 60]);

// visualize our palette to a canvas
const size = 1024;
const canvas = visualize({
  palette,
  background,
  size,
  tiles: 4,
  // tilePadding: (0.1 * size) / 2,
  // margin: 0.1 * size,
});

document.body.appendChild(canvas);
