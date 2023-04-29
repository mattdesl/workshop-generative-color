import Color from "./vendor/color.min.js";

export { Color };

const supportsP3 =
  window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
const outputSpaceId = supportsP3 ? "p3" : "srgb";

// This is to handle older browsers and also edge case on
// Safari 16.1 which seems to support display-p3 but not full
// CSS color spec
export function colorToStyle(color, spaceId = outputSpaceId) {
  // re-parse string if not rgb/hsl
  if (typeof color === "string") {
    return colorToStyle(new Color(color));
  }

  // edge case
  if (!color || !color.spaceId) return String(color);

  // operate on a copy
  color = color.clone();

  // convert to output space
  if (!color.spaceId !== spaceId) color = color.to(spaceId);

  // clamp to space's color gamut
  color.toGamut({ space: spaceId });

  return color.toString();
}
