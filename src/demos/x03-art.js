import Color from "https://colorjs.io/dist/color.js";
import * as random from "../lib/random.js";
import { visualize } from "../lib/test.js";
import sketch from "../lib/sketches/grid.js";

// Replace "" with a seed of your choice to lock randomness
random.setSeed("" || random.getRandomHash());

const hue = random.range(0, 360);
const sat = random.range(25, 75);
const light = random.range(25, 60);
const input = new Color("hsl", [hue, sat, light]);

// create our color palette
const steps = 6;
const palette = [];
for (let i = 0; i < steps; i++) {
  const previous = i == 0 ? input : palette[i - 1];
  const c = new Color(previous);
  c.hsl.l += 5;
  c.hsl.h += 10;
  palette.push(c);
}

visualize(palette, sketch, {
  dimensions: [2048, 1024],
});
