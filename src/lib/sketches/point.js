import * as random from "../random.js";

export default (props) => {
  const { data = {} } = props;
  const { palette = [] } = data;
  const u = random.range(0, 1);
  const v = random.range(0, 1);
  const point = [u, v];
  const corners = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];

  const shapes = [];
  const curColors = random.shuffle(palette);
  for (let i = 0; i < 4; i++) {
    const color = curColors[i % curColors.length];
    const corner0 = corners[i % corners.length];
    const corner1 = corners[(i + 1) % corners.length];
    const path = [point, corner0, corner1];
    shapes.push({ path, color });
  }

  return ({ context, width, height }) => {
    shapes.forEach((shape) => {
      context.lineWidth = width * 0.01;
      context.lineJoin = "round";
      context.strokeStyle = "black";
      context.beginPath();
      context.fillStyle = shape.color;
      shape.path.forEach((p) => context.lineTo(p[0] * width, p[1] * height));
      context.fill();
    });
  };
};
