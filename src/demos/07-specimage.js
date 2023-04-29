// Exercise: Use color science to process images

import { imagePixels } from "../lib/test.js";
import * as random from "../lib/random.js";
import { mapRange, clamp01 } from "../lib/math.js";
import {
  illuminant_d65,
  spectra_to_sRGB,
  sRGB_to_spectra,
  WAVELENGTH_COUNT,
  WAVELENGTH_MAX,
  WAVELENGTH_MIN,
} from "../lib/spectra/spectra.js";

imagePixels({
  url: "images/gonz-ddl-nO2sfLUaxgg-unsplash.jpg",
  maxSize: 340,
  process: (rgb, u, v) => {
    const spec = sRGB_to_spectra(rgb);
    const target = mapRange(
      580,
      WAVELENGTH_MIN,
      WAVELENGTH_MAX,
      0,
      spec.length
    );
    for (let i = 0; i < spec.length; i++) {
      const dist = Math.abs(i - target);
      const falloff = 30;
      // spec[i] *= 1 - clamp01(dist / falloff);
    }
    return spectra_to_sRGB(spec);
  },
});
