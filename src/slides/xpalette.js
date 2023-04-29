import canvasSketch from "https://cdn.jsdelivr.net/npm/canvas-sketch@0.7.7/dist/canvas-sketch.m.js";
import Color from "https://colorjs.io/dist/color.js";

const WIDTH = 512;
const HEIGHT = 512;

const settings = {
  dimensions: [1024, 512],
};

const sketch = () => {
  return ({ context, width, height }) => {
    const primaries = [
      // define a list of primary colors
      new Color("#ff0000"),
      // color strings accepted
      new Color("srgb", [1, 0.5, 0]),
      // or color space name + exact float coords
      new Color("srgb", [0, 0, 0]).to("xyz"),
    ];

    const palette = primaries;

    console.log(palette[0].contrast(palette[1], "LStar"));

    const cellWidth = width / palette.length;
    palette.forEach((color, i) => {
      const x = cellWidth * i;
      const y = 0;
      const w = cellWidth;
      const h = height;

      const str = color.toString();
      console.log(str);
      context.fillStyle = str;
      context.fillRect(x, y, w, h);
    });
  };
};

canvasSketch(sketch, settings);
