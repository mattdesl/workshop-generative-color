// Note that the index order [0, 1, 2, 3] is little-endian

let _nextGaussian = null;
let _hasNextGaussian = false;
let S, R, t, s;
let _seed;

export const setSeed = (hash, print = true) => {
  if (print) console.log(`[random.js] random seed:`, hash);
  _seed = hash;
  _nextGaussian = null;
  _hasNextGaussian = false;
  let c = 1;
  const orig = hash;
  while (hash.length < 64) {
    hash += orig[c++ % orig.length];
  }
  S = Uint32Array.from(
    [0, 1, (s = t = 2), 3].map((i) => parseInt(hash.substr(i * 8 + 0, 8), 16))
  );
  R = (_) => (
    (t = S[3]),
    (S[3] = S[2]),
    (S[2] = S[1]),
    (S[1] = s = S[0]),
    (t ^= t << 11),
    (S[0] ^= t ^ (t >>> 8) ^ (s >>> 19)),
    S[0] / 2 ** 32
  ); /*tx piter*/
};

export const getSeed = () => _seed;

export const value = () => R();

export const boolean = () => value() > 0.5;

export const chance = (n = 0.5) => value() < n;

export const range = (min, max) => {
  if (max == null) {
    max = min;
    min = 0;
  }
  return value() * (max - min) + min;
};

export const rangeFloor = (min, max) => {
  if (max == null) {
    max = min;
    min = 0;
  }
  return Math.floor(range(min, max));
};

export const pick = (array) =>
  array.length ? array[rangeFloor(0, array.length)] : undefined;

export const pickargs = (...args) => args[rangeFloor(0, args.length)];

export const shuffle = (arr) => {
  var rand;
  var tmp;
  var len = arr.length;
  var ret = [...arr];
  while (len) {
    rand = ~~(value() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
};

export const insideCircle = (radius = 1, out = []) => {
  var theta = value() * 2.0 * Math.PI;
  var r = radius * Math.sqrt(value());
  out[0] = r * Math.cos(theta);
  out[1] = r * Math.sin(theta);
  return out;
};

export const weighted = (weights) => {
  var totalWeight = 0;
  var i;

  for (i = 0; i < weights.length; i++) {
    totalWeight += weights[i];
  }

  var random = value() * totalWeight;
  for (i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return i;
    }
    random -= weights[i];
  }
  return 0;
};

// export const weightedSetIndex = (set) => {
//   if (set.length === 0) return -1;
//   return weighted(set.map((s) => s.weight));
// };

// export const weightedSet = (set) => {
//   if (set.length === 0) return null;
//   return set[weightedSetIndex(set)].value;
// };

export const gaussian = (mean = 0, standardDerivation = 1) => {
  // https://github.com/openjdk-mirror/jdk7u-jdk/blob/f4d80957e89a19a29bb9f9807d2a28351ed7f7df/src/share/classes/java/util/Random.java#L496
  if (_hasNextGaussian) {
    _hasNextGaussian = false;
    var result = _nextGaussian;
    _nextGaussian = null;
    return mean + standardDerivation * result;
  } else {
    var v1 = 0;
    var v2 = 0;
    var s = 0;
    do {
      v1 = value() * 2 - 1; // between -1 and 1
      v2 = value() * 2 - 1; // between -1 and 1
      s = v1 * v1 + v2 * v2;
    } while (s >= 1 || s === 0);
    var multiplier = Math.sqrt((-2 * Math.log(s)) / s);
    _nextGaussian = v2 * multiplier;
    _hasNextGaussian = true;
    return mean + standardDerivation * (v1 * multiplier);
  }
};

export const deck = (array) => {
  array = shuffle(array);
  let index = 0;
  return () => {
    let cur = array[index];
    index++;
    if (index > array.length - 1) {
      array = shuffle(array);
      index = 0;
    }
    return cur;
  };
};

export const weightedSet = (list) => list[weighted(list.map((n) => n[1]))][0];

export const sign = () => (value() > 0.5 ? 1 : -1);

export const getRandomHash = () => {
  let result = "";
  for (let i = 16; i > 0; --i)
    result += "0123456789abcdef"[~~(Math.random() * 16)];
  return result;
};

setSeed(getRandomHash(), false);
