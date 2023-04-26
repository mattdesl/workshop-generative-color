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
