export default ({ data }) => {
  const { palette } = data;

  return ({ context, width, height }) => {
    const cellWidth = Math.ceil(width / palette.length);
    palette.forEach((color, i) => {
      const x = cellWidth * i;
      const y = 0;
      const w = cellWidth;
      const h = height;

      const str = color.toString();
      context.fillStyle = str;
      context.fillRect(x, y, w, h);
    });
  };
};
