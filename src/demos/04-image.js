import Color from "https://colorjs.io/dist/color.js";
import { imagePixels } from "../lib/test.js";
import { degToRad } from "../lib/math.js";

imagePixels({
  url: "images/gonz-ddl-nO2sfLUaxgg-unsplash.jpg",
  scale: 1 / 4,
  process: (color, x, y, w, h) => {
    const out = new Color(color);

    // out.lch.l = 0;
    // out.lch.h = 0;

    return out;
  },
});
