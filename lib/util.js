import { getSeed } from "./random.js";

export function loadImage(opt = {}) {
  return new Promise((resolve, reject) => {
    var finished = false;
    var image = new window.Image();
    image.onload = () => {
      if (finished) return;
      finished = true;
      resolve(image);
    };
    image.onerror = () => {
      if (finished) return;
      finished = true;
      reject(new Error("Error while loading image at " + opt.url));
    };
    if (opt.crossOrigin) image.crossOrigin = opt.crossOrigin;
    image.src = opt.url;
  });
}

export function resizePixels(pixels, w1, h1, w2, h2) {
  // int[] temp = new int[w2*h2] ;
  // double x_ratio = w1/(double)w2 ;
  // double y_ratio = h1/(double)h2 ;
  // double px, py ;

  // return temp ;

  const out = new Uint8ClampedArray(w2 * h2 * 4);
  const x_ratio = w1 / w2;
  const y_ratio = h1 / h2;
  for (let i = 0; i < h2; i++) {
    for (let j = 0; j < w2; j++) {
      const px = Math.floor(j * x_ratio);
      const py = Math.floor(i * y_ratio);
      for (let c = 0; c < 4; c++) {
        out[(i * w2 + j) * 4 + c] = pixels[(py * w1 + px) * 4 + c];
      }
    }
  }
  return out;
}

export function createCanvas(attribs = {}) {
  const { width = 1024, height = 1024 } = attribs;
  attribs = { ...attribs };
  delete attribs.width;
  delete attribs.height;
  delete attribs.pixelRatio;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", attribs);

  // scale canvas to browser size
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = "65vmin";
  canvas.style.height = "auto";

  const dispose = attachDownloadKeyCommand(canvas);

  return { dispose, canvas, context };
}

export function attachDownloadKeyCommand(canvas) {
  const handler = (ev) => {
    if (ev.key.toLowerCase() === "s" && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault();
      const today = new Date();
      const yyyy = today.getFullYear();
      let [mm, dd, hh, min, sec] = [
        today.getMonth() + 1, // Months start at 0!
        today.getDate(),
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
      ].map((c) => String(c).padStart(2, "0"));
      const timestamp = `${yyyy}.${mm}.${dd}-${hh}.${min}.${sec}`;
      const seed = getSeed();
      download(canvas, `${timestamp}-${seed}.png`);
    }
  };
  window.addEventListener("keydown", handler, { passive: false });
  return () => window.removeEventListener("keydown", handler);
}

export async function download(canvas, filename) {
  const blob = await new Promise((cb) => canvas.toBlob(cb));
  if (blob == null) return console.warn(`Could not convert canvas to blob`);
  const a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.style.visibility = "hidden";
  a.style.pointerEvents = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(blob);
    a.parentElement.removeChild(a);
  }, 200);
}
