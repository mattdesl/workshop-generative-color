import { Color, colorToStyle } from "./color.js";
import * as random from "./random.js";
import canvasSketch from "https://cdn.jsdelivr.net/npm/canvas-sketch@0.7.7/dist/canvas-sketch.m.js";
import { attachDownloadKeyCommand, loadImage, resizePixels } from "./util.js";

export function visualize(palette, sketch, settings) {
  palette = palette.map((p) => colorToStyle(p));

  settings = {
    dimensions: [2048, 2048],
    suffix: random.getSeed(),
    hotkeys: false,
    ...settings,
  };
  const data = settings.data || {};

  const renderers = [sketch];
  return canvasSketch((props) => {
    const detach = attachDownloadKeyCommand(props.canvas);
    let renderIndex = 0;
    let renderFn;
    generate();

    return {
      render(props) {
        return renderFn(props);
      },
      unload() {
        detach();
      },
    };

    function generate() {
      renderFn = renderers[renderIndex]({
        ...props,
        data: { ...data, palette },
      });
    }
  }, settings);
}

export function imagePixels(opts = {}) {
  const { maxSize = 512 } = opts;
  return canvasSketch(
    async (props) => {
      let image;

      function handlerFunction(ev) {
        ev.preventDefault();
        if (ev.type === "drop") {
          let dt = ev.dataTransfer;
          let files = dt.files;
          if (!files.length) return;
          const file = files[0];
          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            const img = document.createElement("img");
            img.onload = () => {
              redraw(img);
            };
            img.onerror = () =>
              window.alert(`Could not load image: ${file.name}`);
            img.src = reader.result;
          };
          reader.onerror = () =>
            window.alert(`Could not read file: ${file.name}`);
        }
      }

      const container = window;

      container.addEventListener("dragenter", handlerFunction, false);
      container.addEventListener("dragleave", handlerFunction, false);
      container.addEventListener("dragover", handlerFunction, false);
      container.addEventListener("drop", handlerFunction, false);

      let sampleIndex,
        srcWidth,
        srcHeight,
        tilesX,
        tilesY,
        tileSizeX,
        tileSizeY,
        maxSamplesPerFrame,
        aspect,
        totalSamples,
        pixels;

      let tmpCanvas = document.createElement("canvas");
      let tmpContext = tmpCanvas.getContext("2d");

      let tmpImgData;

      function redraw(image, doRender = true) {
        srcWidth = image.width;
        srcHeight = image.height;
        aspect = srcWidth / srcHeight;

        let maxArr = Array.isArray(maxSize) ? maxSize : [maxSize, maxSize];
        let [maxWidth, maxHeight] = maxArr;

        const ratio = Math.min(1, maxWidth / srcWidth, maxHeight / srcHeight);
        tilesX = Math.round(srcWidth * ratio);
        tilesY = Math.round(srcHeight * ratio);

        const targetWidth = tilesX;
        let dstWidth = targetWidth;
        let dstHeight = Math.round(dstWidth / aspect);

        tileSizeX = Math.round(dstWidth / tilesX);
        tileSizeY = Math.round(dstHeight / tilesY);

        maxSamplesPerFrame = tilesX * 4;
        totalSamples = tilesX * tilesY;

        dstWidth = Math.round(tileSizeX * tilesX);
        dstHeight = Math.round(tileSizeY * tilesY);
        props.update({ dimensions: [dstWidth, dstHeight] });

        tmpCanvas.width = srcWidth;
        tmpCanvas.height = srcHeight;
        tmpContext.clearRect(0, 0, srcWidth, srcHeight);
        tmpContext.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);
        const imgData = tmpContext.getImageData(0, 0, srcWidth, srcHeight);
        pixels = imgData.data;

        props.context.drawImage(image, 0, 0, dstWidth, dstHeight);
        sampleIndex = 0;

        if (doRender) {
          props.play();
        }
      }

      function resizeStyle() {
        if (window.innerWidth / window.innerHeight > aspect) {
          props.canvas.style.height = "80vh";
          props.canvas.style.width = "auto";
        } else {
          props.canvas.style.width = "80vw";
          props.canvas.style.height = "auto";
        }
      }

      attachDownloadKeyCommand(props.canvas);
      image = await loadImage(opts);
      resizeStyle();
      redraw(image, false);
      window.addEventListener("resize", resizeStyle, { passive: true });

      return (props) => {
        const { context, width, height } = props;

        if (sampleIndex >= totalSamples) {
          props.pause();
          return;
        }

        let samplesPerFrame = 0;
        while (
          samplesPerFrame < maxSamplesPerFrame &&
          sampleIndex < totalSamples
        ) {
          const x = Math.floor(sampleIndex % tilesX);
          const y = Math.floor(sampleIndex / tilesX);

          const px = Math.floor((x / tilesX) * srcWidth);
          const py = Math.floor((y / tilesY) * srcHeight);
          const srcIdx = px + py * srcWidth;
          const r = pixels[srcIdx * 4 + 0];
          const g = pixels[srcIdx * 4 + 1];
          const b = pixels[srcIdx * 4 + 2];
          let rgb = new Color("srgb", [r / 0xff, g / 0xff, b / 0xff]);
          if (opts.process) {
            rgb = opts.process(rgb, x / (tilesX - 1), y / (tilesY - 1));
          }
          context.fillStyle = colorToStyle(rgb);

          // This would be much faster by modifying pixels directly
          const tx = x * tileSizeX;
          const ty = y * tileSizeY;
          context.fillRect(tx, ty, tileSizeX, tileSizeY);
          samplesPerFrame++;
          sampleIndex++;
        }

        if (sampleIndex < totalSamples) {
          const x = Math.floor(sampleIndex % tilesX);
          const y = Math.floor(sampleIndex / tilesX);
          const tx = x * tileSizeX;
          const ty = y * tileSizeY;
          context.fillStyle = "white";
          context.globalCompositeOperation = "difference";
          context.fillRect(tx, ty, width, height * 0.00175);
          context.globalCompositeOperation = "source-over";
        }

        resizeStyle();
      };
    },
    {
      hotkeys: false,
      styleCanvas: false,
      pixelated: true,
      animate: true,
    }
  );
}

export function pluginGrid(fn) {
  return (props) => {
    const { context, width, height, data = {} } = props;
    const { background = "white" } = data;
    const cells = gridTiles(width, height, data).map((tile) => {
      context.save();
      context.translate(tile.x, tile.y);
      const cellProps = {
        width: tile.width,
        height: tile.height,
        data: {
          ...data,
          tile,
        },
      };
      const sketch = fn({
        ...props,
        ...cellProps,
      });
      context.restore();
      return {
        tile,
        sketch,
        props: cellProps,
      };
    });

    return (props) => {
      const { context, width, height } = props;

      if (background) {
        context.fillStyle = colorToStyle(background);
        context.fillRect(0, 0, width, height);
      }

      for (let cell of cells) {
        context.save();
        context.translate(cell.tile.x, cell.tile.y);
        cell.sketch({ ...props, ...cell.props });
        context.restore();
      }
    };
  };
}

export function gridTiles(width, height, opt = {}) {
  let {
    rows = 2,
    columns = 2,
    margin = width * 0.1,
    tilePadding = (width * 0.05) / 2,
    verticalAlign = "center",
    horizontalAlign = "center",
    offset = [0, 0],
    squareTiles = true,
  } = opt;

  if (typeof opt.margin === "function") margin = opt.margin({ width, height });
  if (typeof opt.tilePadding === "function")
    tilePadding = opt.tilePadding({ width, height });

  const innerWidth = width - margin * 2;
  const innerHeight = height - margin * 2;

  let tileWidth, tileHeight;
  tileWidth = (innerWidth - tilePadding * (columns - 1)) / columns;
  tileHeight = (innerHeight - tilePadding * (rows - 1)) / rows;
  if (squareTiles) {
    const sq = Math.min(tileWidth, tileHeight);
    tileWidth = tileHeight = sq;
  }

  const boundsWidth = tileWidth * columns + tilePadding * (columns - 1);
  const boundsHeight = tileHeight * rows + tilePadding * (rows - 1);

  const tiles = [];
  for (let row = 0, index = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++, index++) {
      let ox, oy;

      if (horizontalAlign === "left") ox = margin;
      else if (horizontalAlign === "right") ox = width - margin - boundsWidth;
      else ox = (width - boundsWidth) / 2;

      if (verticalAlign === "top") oy = margin;
      else if (verticalAlign === "bottom") oy = height - margin - boundsHeight;
      else oy = (height - boundsHeight) / 2;

      ox += (offset[0] * width) / 2;
      oy += (offset[1] * height) / 2;

      const px = ox + column * (tileWidth + tilePadding);
      const py = oy + row * (tileHeight + tilePadding);
      tiles.push({
        index,
        row,
        column,
        x: px,
        y: py,
        width: tileWidth,
        height: tileHeight,
        surfaceWidth: width,
        surfaceHeight: height,
      });
    }
  }
  return tiles;
}
