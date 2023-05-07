import Color from "./vendor/color.min.js";

export { Color };

// set this to false if we want to disable P3 outputs
const USE_P3 = true;

const supportsP3 =
  window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");

const widestOutputSpace = USE_P3 && supportsP3 ? "p3" : "srgb";

// This is to handle older browsers and also edge case on
// Safari 16.1 which seems to support display-p3 but not full
// CSS color spec
export function colorToStyle(color, spaceId) {
  // re-parse string if not rgb/hsl
  if (typeof color === "string") {
    return colorToStyle(new Color(color));
  }

  // edge case
  if (!color || !color.spaceId) return String(color);

  // operate on a copy
  color = color.clone();

  // no output space , decide on one
  if (!spaceId) {
    // if color is in srgb gamut, just stick with that
    if (color.spaceId === "srgb" && color.inGamut()) spaceId = "srgb";
    // otherwise maximize gamut depending on browser support
    else spaceId = widestOutputSpace;
  }

  // now convert to the desired output space if needed
  if (!color.spaceId !== spaceId) {
    color = color.to(spaceId);
  }

  // clamp to space's color gamut
  color.toGamut({ space: spaceId });

  return color.toString();
}
