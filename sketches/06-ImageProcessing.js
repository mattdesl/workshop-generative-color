// Exercise: Use color science to process images

import { Color, colorToStyle } from "../lib/color.js";
import { imagePixels } from "../lib/test.js";
import * as random from "../lib/random.js";
import { mapRange } from "../lib/math.js";

imagePixels({
  url: "/sketches/images/gonz-ddl-nO2sfLUaxgg-unsplash.jpg",
  maxSize: 300,
  process: (color, u, v) => {
    const out = new Color(color);

    const hue = out.lch.h;
    out.lch.c = mapRange(v, 0, 1, 0, 50);
    out.lch.h = u * 50;

    out.lch.l += random.gaussian(0, 2);

    return out;
  },
});
