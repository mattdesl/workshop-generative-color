// Data is already in 380+5+780 format

import CMF_5 from "./cie1931-xyzbar-380+5+780.js";
import illuminant_d65_5 from "./illuminant-d65-380+5+780.js";
import illuminant_c_5 from "./illuminant-c-380+5+780.js";
import ColorChecker from "./colorchecker.js";
import { clamp01 } from "../math.js";
import basis from "./cie1931-basis-bt709-380+5+780.js";

export { ColorChecker };

export const WAVELENGTH_MIN = 380;
export const WAVELENGTH_MAX = 780;
export const WAVELENGTH_STEP = 5;
export const WAVELENGTH_COUNT =
  (WAVELENGTH_MAX + WAVELENGTH_STEP - WAVELENGTH_MIN) / WAVELENGTH_STEP;

function resample(spec) {
  if (spec.length !== WAVELENGTH_COUNT)
    throw new Error("data has invalid wavelength step");
  return spec;
  // const out = [];
  // for (let i = 0, w = 380; i < spec.length && w <= 730; i++, w += 5) {
  //   if (w % 10 === 0) {
  //     out.push(spec[i]);
  //   }
  // }
  // return out;
}

export const CMF = resample(CMF_5);
export const illuminant_d65 = resample(illuminant_d65_5);
export const illuminant_e = resample(illuminant_d65_5).map(() => 1);
export const illuminant_c = resample(illuminant_c_5);
export const basis_bt709 = resample(basis);

const CIE_CMF_Y = CMF.map((c) => c[1]);

export const XYZ_d65_to_linearRGB_matrix = [
  [3.2406, -1.5372, -0.4986],
  [-0.9689, 1.8758, 0.0415],
  [0.0557, -0.204, 1.057],
];

export const xyY_to_XYZ = (arg) => {
  var X, Y, Z, x, y;
  x = arg[0];
  y = arg[1];
  Y = arg[2];
  if (y === 0) {
    return [0, 0, 0];
  }
  X = (x * Y) / y;
  Z = ((1 - x - y) * Y) / y;
  return [X, Y, Z];
};

export const xyz_to_xyY = (arg) => {
  var sum, X, Y, Z;
  X = arg[0];
  Y = arg[1];
  Z = arg[2];
  sum = X + Y + Z;
  if (sum === 0) {
    return [0, 0, Y];
  }
  return [X / sum, Y / sum, Y];
};

// Note these gamma functions are specific to sRGB space
// Other spaces use different gamma/transfer functions
const gamma_to_linear = (c) =>
  c >= 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;

const linear_to_gamma = (c) =>
  c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;

function dotproduct(a, b) {
  let r = 0;
  for (let i = 0; i < a.length; i++) {
    r += a[i] * b[i];
  }
  return r;
}

function linear_to_concentration(l1, l2, t) {
  let t1 = l1 * (1 - t) ** 2;
  let t2 = l2 * t ** 2;
  return t2 / (t1 + t2);
}

export function mix_spectra(R1, R2, t) {
  let l1 = Math.max(1e-14, dotproduct(R1, CIE_CMF_Y));
  let l2 = Math.max(1e-14, dotproduct(R2, CIE_CMF_Y));
  t = linear_to_concentration(l1, l2, t);

  const R = new Array(WAVELENGTH_COUNT);
  for (let i = 0; i < WAVELENGTH_COUNT; i++) {
    const R1_nz = Math.max(1e-14, R1[i]);
    const R2_nz = Math.max(1e-14, R2[i]);
    let KS =
      (1 - t) * ((1 - R1_nz) ** 2 / (2 * R1_nz)) +
      t * ((1 - R2_nz) ** 2 / (2 * R2_nz));
    // output reflectance
    R[i] = reflectance_mix(KS);
  }
  return R;
}

function reflectance_mix(ks) {
  return 1.0 + ks - Math.sqrt(ks ** 2 + 2.0 * ks);
}

export function sRGB_to_linearRGB(sRGB) {
  return sRGB.map((n) => gamma_to_linear(n / 0xff));
}

export function linearRGB_to_sRGB(linearRGB) {
  return linearRGB.map((n) => Math.round(linear_to_gamma(clamp01(n)) * 0xff));
}

export function sRGB_to_spectra(sRGB) {
  const [r, g, b] = sRGB.map((s) => gamma_to_linear(s / 0xff));
  const spec = new Array(WAVELENGTH_COUNT);

  // in 0..1 range
  for (var i = 0; i < WAVELENGTH_COUNT; ++i) {
    const xyz = basis_bt709[i];
    spec[i] = xyz[0] * r + xyz[1] * g + xyz[2] * b;
  }
  return spec;
}

export function linearRGB_to_spectra(rgb) {
  const [r, g, b] = rgb;
  const spec = new Array(WAVELENGTH_COUNT);

  // in 0..1 range
  for (var i = 0; i < WAVELENGTH_COUNT; ++i) {
    const xyz = basis_bt709[i];
    spec[i] = xyz[0] * r + xyz[1] * g + xyz[2] * b;
  }
  return spec;
}

export function spectra_to_XYZ(reflectance, illuminant = illuminant_d65) {
  let X = 0,
    Y = 0,
    Z = 0,
    S = 0;
  let scaleByIlluminant = illuminant !== false;
  let hasIlluminant = scaleByIlluminant && Array.isArray(illuminant);
  for (let i = 0; i < reflectance.length; i++) {
    let I = 1;
    if (hasIlluminant) I = illuminant[i]; // SPD
    else if (typeof illuminant === "number") I = illuminant; // fixed value
    var intensity = reflectance[i] * I;
    X += CMF[i][0] * intensity;
    Y += CMF[i][1] * intensity;
    Z += CMF[i][2] * intensity;
    S += CMF[i][1];
  }
  if (scaleByIlluminant) {
    X /= S;
    Y /= S;
    Z /= S;
  }
  return [X, Y, Z];
}

export function spectra_to_Y(reflectance, illuminant = illuminant_d65) {
  let Y = 0,
    S = 0;
  let scaleByIlluminant = illuminant !== false;
  let hasIlluminant = scaleByIlluminant && Array.isArray(illuminant);
  for (let i = 0; i < reflectance.length; i++) {
    let I = 1;
    if (hasIlluminant) I = illuminant[i]; // SPD
    else if (typeof illuminant === "number") I = illuminant; // fixed value
    var intensity = reflectance[i] * I;
    Y += CMF[i][1] * intensity;
    S += CMF[i][1];
  }
  if (scaleByIlluminant) {
    Y /= S;
  }
  return Y;
}

export function XYZ_to_linearRGB(XYZ) {
  let [x, y, z] = XYZ;
  const whitepoint = [100, 100, 100];
  x /= whitepoint[0];
  y /= whitepoint[1];
  z /= whitepoint[2];
  return XYZ_d65_to_linearRGB_matrix.map(
    (vec) => vec[0] * x + vec[1] * y + vec[2] * z
  );
}

export function wavelength_to_sRGB(len) {
  return XYZ_to_sRGB(wavelength_to_XYZ(len));
}

export function wavelength_to_XYZ(len) {
  if (len < WAVELENGTH_MIN || len > WAVELENGTH_MAX) return [0, 0, 0];

  len -= WAVELENGTH_MIN;
  const index = Math.floor(len / WAVELENGTH_STEP);
  const offset = len - WAVELENGTH_STEP * index;
  if (index >= CMF.length - 1) return CMF[CMF.length - 1].map((x) => x * 100);

  const x0 = index * WAVELENGTH_STEP;
  const x1 = x0 + WAVELENGTH_STEP;
  const v0 = CMF[index];
  const v1 = CMF[index + 1];

  const pixel = [0, 0, 0];
  let S = 0;
  for (let i = 0; i < 3; i++) {
    pixel[i] = (v0[i] + (offset * (v1[i] - v0[i])) / (x1 - x0)) * 100;
  }
  return pixel;
}

export function XYZ_to_sRGB(XYZ) {
  return linearRGB_to_sRGB(XYZ_to_linearRGB(XYZ));
}

export function spectra_to_sRGB(reflectance) {
  return XYZ_to_sRGB(spectra_to_XYZ(reflectance));
}
