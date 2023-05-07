// Exercise: Use color science to process images

import { Color } from "../lib/color.js";
import { imagePixels } from "../lib/test.js";
import * as random from "../lib/random.js";
import { mapRange, smoothstep, step, fract, lerpArray } from "../lib/math.js";

imagePixels({
  url: "/assets/images/gonz-ddl-nO2sfLUaxgg-unsplash.jpg",
  maxSize: 500,
  process: (color, u, v, w, h) => {
    const out = new Color(color);

    // boost chroma
    // out.oklch.c *= 4;

    // shift hue
    out.oklch.h += 80;

    // desaturate by N%
    out.oklch.c *= 0.75;

    // add noise in lightness only
    out.oklch.l += random.gaussian(0, 2 / 100);

    // add a vignette
    out.oklch.l *= smoothstep(1, 0.5, Math.hypot(u - 0.5, v - 0.5));

    return out;
  },
});
