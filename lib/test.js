import { Color, colorToStyle } from "./color.js";

import canvasSketch from "./vendor/canvas-sketch.m.js";
import { attachDownloadKeyCommand, loadImage, resizePixels } from "./util.js";

export function imagePixels(opts = {}) {
  return canvasSketch(imageSketch, {
    hotkeys: false,
    styleCanvas: false,
    pixelated: true,
    animate: true,
    data: opts,
  });
}

async function imageSketch(props) {
  const opts = props.data || {};
  const { maxSize = 512 } = opts;
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
        img.onerror = () => window.alert(`Could not load image: ${file.name}`);
        img.src = reader.result;
      };
      reader.onerror = () => window.alert(`Could not read file: ${file.name}`);
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
    while (samplesPerFrame < maxSamplesPerFrame && sampleIndex < totalSamples) {
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
        rgb = opts.process(
          rgb,
          x / (tilesX - 1),
          y / (tilesY - 1),
          srcWidth,
          srcHeight
        );
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
      // const x = Math.floor(sampleIndex % tilesX);
      // const y = Math.floor(sampleIndex / tilesX);
      // const tx = x * tileSizeX;
      // const ty = y * tileSizeY;
      // context.fillStyle = "white";
      // context.globalCompositeOperation = "difference";
      // context.fillRect(tx, ty, width, height * 0.00175);
      // context.globalCompositeOperation = "source-over";
    }

    resizeStyle();
  };
}
