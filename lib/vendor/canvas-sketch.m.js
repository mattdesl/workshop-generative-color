/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var browser =
  commonjsGlobal.performance &&
  commonjsGlobal.performance.now ? function now() {
    return performance.now()
  } : Date.now || function now() {
    return +new Date
  };

var isPromise_1 = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

var isDom = isNode;

function isNode (val) {
  return (!val || typeof val !== 'object')
    ? false
    : (typeof window === 'object' && typeof window.Node === 'object')
      ? (val instanceof window.Node)
      : (typeof val.nodeType === 'number') &&
        (typeof val.nodeName === 'string')
}

function getClientAPI() {
    return typeof window !== "undefined" && window["canvas-sketch-cli"];
}

function defined() {
    var arguments$1 = arguments;

    for (var i = 0;i < arguments.length; i++) {
        if (arguments$1[i] != null) {
            return arguments$1[i];
        }
    }
    return undefined;
}

function isBrowser() {
    return typeof document !== "undefined";
}

function isWebGLContext(ctx) {
    return ctx && typeof ctx.clear === "function" && typeof ctx.clearColor === "function" && typeof ctx.bufferData === "function";
}

function is2DContext(ctx) {
    return ctx && typeof ctx.save === "function" && typeof ctx.scale === "function" && typeof ctx.restore === "function";
}

function isCanvas(element) {
    return isDom(element) && /canvas/i.test(element.nodeName) && typeof element.getContext === "function";
}

var keys = createCommonjsModule(function (module, exports) {
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
});
var keys_1 = keys.shim;

var is_arguments = createCommonjsModule(function (module, exports) {
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}
exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
}});
var is_arguments_1 = is_arguments.supported;
var is_arguments_2 = is_arguments.unsupported;

var deepEqual_1 = createCommonjsModule(function (module) {
var pSlice = Array.prototype.slice;



var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (is_arguments(a)) {
    if (!is_arguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = keys(a),
        kb = keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}
});

var dateformat = createCommonjsModule(function (module, exports) {
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

(function(global) {

  var dateFormat = (function() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|"[^"]*"|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
  
      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, gmt) {
  
        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
  
        date = date || new Date;
  
        if(!(date instanceof Date)) {
          date = new Date(date);
        }
  
        if (isNaN(date)) {
          throw TypeError('Invalid date');
        }
  
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
  
        // Allow setting the utc/gmt argument via the mask
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === 'GMT:') {
            gmt = true;
          }
        }
  
        var _ = utc ? 'getUTC' : 'get';
        var d = date[_ + 'Date']();
        var D = date[_ + 'Day']();
        var m = date[_ + 'Month']();
        var y = date[_ + 'FullYear']();
        var H = date[_ + 'Hours']();
        var M = date[_ + 'Minutes']();
        var s = date[_ + 'Seconds']();
        var L = date[_ + 'Milliseconds']();
        var o = utc ? 0 : date.getTimezoneOffset();
        var W = getWeek(date);
        var N = getDayOfWeek(date);
        var flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dateFormat.i18n.dayNames[D],
          dddd: dateFormat.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dateFormat.i18n.monthNames[m],
          mmmm: dateFormat.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(Math.round(L / 10)),
          t:    H < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1],
          tt:   H < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3],
          T:    H < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5],
          TT:   H < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7],
          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
          W:    W,
          N:    N
        };
  
        return mask.replace(token, function (match) {
          if (match in flags) {
            return flags[match];
          }
          return match.slice(1, match.length - 1);
        });
      };
    })();

  dateFormat.masks = {
    'default':               'ddd mmm dd yyyy HH:MM:ss',
    'shortDate':             'm/d/yy',
    'mediumDate':            'mmm d, yyyy',
    'longDate':              'mmmm d, yyyy',
    'fullDate':              'dddd, mmmm d, yyyy',
    'shortTime':             'h:MM TT',
    'mediumTime':            'h:MM:ss TT',
    'longTime':              'h:MM:ss TT Z',
    'isoDate':               'yyyy-mm-dd',
    'isoTime':               'HH:MM:ss',
    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ],
    timeNames: [
      'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
  };

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Object} `date`
 * @return {Number}
 */
function getWeek(date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occurred and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
  return 1 + Math.floor(weekDiff);
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 * 
 * @param  {Object} `date`
 * @return {Number}
 */
function getDayOfWeek(date) {
  var dow = date.getDay();
  if(dow === 0) {
    dow = 7;
  }
  return dow;
}

/**
 * kind-of shortcut
 * @param  {*} val
 * @return {String}
 */
function kindOf(val) {
  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (typeof val !== 'object') {
    return typeof val;
  }

  if (Array.isArray(val)) {
    return 'array';
  }

  return {}.toString.call(val)
    .slice(8, -1).toLowerCase();
}


  if (typeof undefined === 'function' && undefined.amd) {
    undefined(function () {
      return dateFormat;
    });
  } else {
    module.exports = dateFormat;
  }
})(commonjsGlobal);
});

/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

/**
 * Results cache
 */

var res = '';
var cache;

/**
 * Expose `repeat`
 */

var repeatString = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // cover common, quick use cases
  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  } else if (res.length >= max) {
    return res.substr(0, max);
  }

  while (max > res.length && num > 1) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    str += str;
  }

  res += str;
  res = res.substr(0, max);
  return res;
}

var padLeft = function padLeft(str, num, ch) {
  str = str.toString();

  if (typeof num === 'undefined') {
    return str;
  }

  if (ch === 0) {
    ch = '0';
  } else if (ch) {
    ch = ch.toString();
  } else {
    ch = ' ';
  }

  return repeatString(ch, num - str.length) + str;
};

var noop = function () {};
var link;
var defaultExts = {
    extension: '',
    prefix: '',
    suffix: ''
};
var supportedEncodings = ['image/png','image/jpeg','image/webp'];
function stream(isStart, opts) {
    if ( opts === void 0 ) opts = {};

    return new Promise(function (resolve, reject) {
        opts = objectAssign({}, defaultExts, opts);
        var filename = resolveFilename(Object.assign({}, opts, {
            extension: '',
            frame: undefined
        }));
        var func = isStart ? 'streamStart' : 'streamEnd';
        var client = getClientAPI();
        if (client && client.output && typeof client[func] === 'function') {
            return client[func](objectAssign({}, opts, {
                filename: filename
            })).then(function (ev) { return resolve(ev); });
        } else {
            return resolve({
                filename: filename,
                client: false
            });
        }
    });
}

function streamStart(opts) {
    if ( opts === void 0 ) opts = {};

    return stream(true, opts);
}

function streamEnd(opts) {
    if ( opts === void 0 ) opts = {};

    return stream(false, opts);
}

function exportCanvas(canvas, opt) {
    if ( opt === void 0 ) opt = {};

    var encoding = opt.encoding || 'image/png';
    if (!supportedEncodings.includes(encoding)) 
        { throw new Error(("Invalid canvas encoding " + encoding)); }
    var extension = (encoding.split('/')[1] || '').replace(/jpeg/i, 'jpg');
    if (extension) 
        { extension = ("." + extension).toLowerCase(); }
    return {
        extension: extension,
        type: encoding,
        dataURL: canvas.toDataURL(encoding, opt.encodingQuality)
    };
}

function createBlobFromDataURL(dataURL) {
    return new Promise(function (resolve) {
        var splitIndex = dataURL.indexOf(',');
        if (splitIndex === -1) {
            resolve(new window.Blob());
            return;
        }
        var base64 = dataURL.slice(splitIndex + 1);
        var byteString = window.atob(base64);
        var type = dataURL.slice(0, splitIndex);
        var mimeMatch = /data:([^;]+)/.exec(type);
        var mime = (mimeMatch ? mimeMatch[1] : '') || undefined;
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0;i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        resolve(new window.Blob([ab], {
            type: mime
        }));
    });
}

function saveDataURL(dataURL, opts) {
    if ( opts === void 0 ) opts = {};

    return createBlobFromDataURL(dataURL).then(function (blob) { return saveBlob(blob, opts); });
}

function saveBlob(blob, opts) {
    if ( opts === void 0 ) opts = {};

    return new Promise(function (resolve) {
        opts = objectAssign({}, defaultExts, opts);
        var filename = opts.filename;
        var client = getClientAPI();
        if (client && typeof client.saveBlob === 'function' && client.output) {
            return client.saveBlob(blob, objectAssign({}, opts, {
                filename: filename
            })).then(function (ev) { return resolve(ev); });
        } else {
            if (!link) {
                link = document.createElement('a');
                link.style.visibility = 'hidden';
                link.target = '_blank';
            }
            link.download = filename;
            link.href = window.URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.onclick = (function () {
                link.onclick = noop;
                setTimeout(function () {
                    window.URL.revokeObjectURL(blob);
                    if (link.parentElement) 
                        { link.parentElement.removeChild(link); }
                    link.removeAttribute('href');
                    resolve({
                        filename: filename,
                        client: false
                    });
                });
            });
            link.click();
        }
    });
}

function saveFile(data, opts) {
    if ( opts === void 0 ) opts = {};

    var parts = Array.isArray(data) ? data : [data];
    var blob = new window.Blob(parts, {
        type: opts.type || ''
    });
    return saveBlob(blob, opts);
}

function getTimeStamp() {
    var dateFormatStr = "yyyy.mm.dd-HH.MM.ss";
    return dateformat(new Date(), dateFormatStr);
}

function resolveFilename(opt) {
    if ( opt === void 0 ) opt = {};

    opt = objectAssign({}, opt);
    if (typeof opt.file === 'function') {
        return opt.file(opt);
    } else if (opt.file) {
        return opt.file;
    }
    var frame = null;
    var extension = '';
    if (typeof opt.extension === 'string') 
        { extension = opt.extension; }
    if (typeof opt.frame === 'number') {
        var totalFrames;
        if (typeof opt.totalFrames === 'number') {
            totalFrames = opt.totalFrames;
        } else {
            totalFrames = Math.max(10000, opt.frame);
        }
        frame = padLeft(String(opt.frame), String(totalFrames).length, '0');
    }
    var layerStr = isFinite(opt.totalLayers) && isFinite(opt.layer) && opt.totalLayers > 1 ? ("" + (opt.layer)) : '';
    if (frame != null) {
        return [layerStr,frame].filter(Boolean).join('-') + extension;
    } else {
        var defaultFileName = opt.timeStamp;
        return [opt.prefix,opt.name || defaultFileName,layerStr,opt.hash,opt.suffix].filter(Boolean).join('-') + extension;
    }
}

var commonTypos = {
    dimension: 'dimensions',
    animated: 'animate',
    animating: 'animate',
    unit: 'units',
    P5: 'p5',
    pixellated: 'pixelated',
    looping: 'loop',
    pixelPerInch: 'pixels'
};
var allKeys = ['dimensions','units','pixelsPerInch','orientation','scaleToFit',
    'scaleToView','bleed','pixelRatio','exportPixelRatio','maxPixelRatio','scaleContext',
    'resizeCanvas','styleCanvas','canvas','context','attributes','parent','file',
    'name','prefix','suffix','animate','playing','loop','duration','totalFrames',
    'fps','playbackRate','timeScale','frame','time','flush','pixelated','hotkeys',
    'p5','id','scaleToFitPadding','data','params','encoding','encodingQuality'];
var checkSettings = function (settings) {
    var keys = Object.keys(settings);
    keys.forEach(function (key) {
        if (key in commonTypos) {
            var actual = commonTypos[key];
            console.warn(("[canvas-sketch] Could not recognize the setting \"" + key + "\", did you mean \"" + actual + "\"?"));
        } else if (!allKeys.includes(key)) {
            console.warn(("[canvas-sketch] Could not recognize the setting \"" + key + "\""));
        }
    });
};

function keyboardShortcuts (opt) {
    if ( opt === void 0 ) opt = {};

    var handler = function (ev) {
        if (!opt.enabled()) 
            { return; }
        var client = getClientAPI();
        if (ev.keyCode === 83 && !ev.altKey && (ev.metaKey || ev.ctrlKey)) {
            ev.preventDefault();
            opt.save(ev);
        } else if (ev.keyCode === 32) {
            opt.togglePlay(ev);
        } else if (client && !ev.altKey && ev.keyCode === 75 && (ev.metaKey || ev.ctrlKey)) {
            ev.preventDefault();
            opt.commit(ev);
        }
    };
    var attach = function () {
        window.addEventListener('keydown', handler);
    };
    var detach = function () {
        window.removeEventListener('keydown', handler);
    };
    return {
        attach: attach,
        detach: detach
    };
}

var defaultUnits = 'mm';
var data = [['postcard',101.6,152.4],['poster-small',280,430],['poster',460,610],
    ['poster-large',610,910],['business-card',50.8,88.9],['2r',64,89],['3r',89,127],
    ['4r',102,152],['5r',127,178],['6r',152,203],['8r',203,254],['10r',254,305],['11r',
    279,356],['12r',305,381],['a0',841,1189],['a1',594,841],['a2',420,594],['a3',
    297,420],['a4',210,297],['a5',148,210],['a6',105,148],['a7',74,105],['a8',52,
    74],['a9',37,52],['a10',26,37],['2a0',1189,1682],['4a0',1682,2378],['b0',1000,
    1414],['b1',707,1000],['b1+',720,1020],['b2',500,707],['b2+',520,720],['b3',353,
    500],['b4',250,353],['b5',176,250],['b6',125,176],['b7',88,125],['b8',62,88],
    ['b9',44,62],['b10',31,44],['b11',22,32],['b12',16,22],['c0',917,1297],['c1',
    648,917],['c2',458,648],['c3',324,458],['c4',229,324],['c5',162,229],['c6',114,
    162],['c7',81,114],['c8',57,81],['c9',40,57],['c10',28,40],['c11',22,32],['c12',
    16,22],['half-letter',5.5,8.5,'in'],['letter',8.5,11,'in'],['legal',8.5,14,'in'],
    ['junior-legal',5,8,'in'],['ledger',11,17,'in'],['tabloid',11,17,'in'],['ansi-a',
    8.5,11.0,'in'],['ansi-b',11.0,17.0,'in'],['ansi-c',17.0,22.0,'in'],['ansi-d',
    22.0,34.0,'in'],['ansi-e',34.0,44.0,'in'],['arch-a',9,12,'in'],['arch-b',12,18,
    'in'],['arch-c',18,24,'in'],['arch-d',24,36,'in'],['arch-e',36,48,'in'],['arch-e1',
    30,42,'in'],['arch-e2',26,38,'in'],['arch-e3',27,39,'in']];
var paperSizes = data.reduce(function (dict, preset) {
    var item = {
        units: preset[3] || defaultUnits,
        dimensions: [preset[1],preset[2]]
    };
    dict[preset[0]] = item;
    dict[preset[0].replace(/-/g, ' ')] = item;
    return dict;
}, {})

var defined$1 = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

var units = [ 'mm', 'cm', 'm', 'pc', 'pt', 'in', 'ft', 'px' ];

var conversions = {
  // metric
  m: {
    system: 'metric',
    factor: 1
  },
  cm: {
    system: 'metric',
    factor: 1 / 100
  },
  mm: {
    system: 'metric',
    factor: 1 / 1000
  },
  // imperial
  pt: {
    system: 'imperial',
    factor: 1 / 72
  },
  pc: {
    system: 'imperial',
    factor: 1 / 6
  },
  in: {
    system: 'imperial',
    factor: 1
  },
  ft: {
    system: 'imperial',
    factor: 12
  }
};

const anchors = {
  metric: {
    unit: 'm',
    ratio: 1 / 0.0254
  },
  imperial: {
    unit: 'in',
    ratio: 0.0254
  }
};

function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function convertDistance (value, fromUnit, toUnit, opts) {
  if (typeof value !== 'number' || !isFinite(value)) throw new Error('Value must be a finite number');
  if (!fromUnit || !toUnit) throw new Error('Must specify from and to units');

  opts = opts || {};
  var pixelsPerInch = defined$1(opts.pixelsPerInch, 96);
  var precision = opts.precision;
  var roundPixel = opts.roundPixel !== false;

  fromUnit = fromUnit.toLowerCase();
  toUnit = toUnit.toLowerCase();

  if (units.indexOf(fromUnit) === -1) throw new Error('Invalid from unit "' + fromUnit + '", must be one of: ' + units.join(', '));
  if (units.indexOf(toUnit) === -1) throw new Error('Invalid from unit "' + toUnit + '", must be one of: ' + units.join(', '));

  if (fromUnit === toUnit) {
    // We don't need to convert from A to B since they are the same already
    return value;
  }

  var toFactor = 1;
  var fromFactor = 1;
  var isToPixel = false;

  if (fromUnit === 'px') {
    fromFactor = 1 / pixelsPerInch;
    fromUnit = 'in';
  }
  if (toUnit === 'px') {
    isToPixel = true;
    toFactor = pixelsPerInch;
    toUnit = 'in';
  }

  var fromUnitData = conversions[fromUnit];
  var toUnitData = conversions[toUnit];

  // source to anchor inside source's system
  var anchor = value * fromUnitData.factor * fromFactor;

  // if systems differ, convert one to another
  if (fromUnitData.system !== toUnitData.system) {
    // regular 'm' to 'in' and so forth
    anchor *= anchors[fromUnitData.system].ratio;
  }

  var result = anchor / toUnitData.factor * toFactor;
  if (isToPixel && roundPixel) {
    result = Math.round(result);
  } else if (typeof precision === 'number' && isFinite(precision)) {
    result = round(result, precision);
  }
  return result;
}

var convertLength = convertDistance;
var units_1 = units;
convertLength.units = units_1;

function getDimensionsFromPreset(dimensions, unitsTo, pixelsPerInch) {
    if ( unitsTo === void 0 ) unitsTo = 'px';
    if ( pixelsPerInch === void 0 ) pixelsPerInch = 72;

    if (typeof dimensions === 'string') {
        var key = dimensions.toLowerCase();
        if (!(key in paperSizes)) {
            throw new Error(("The dimension preset \"" + dimensions + "\" is not supported or could not be found; try using a4, a3, postcard, letter, etc."));
        }
        var preset = paperSizes[key];
        return preset.dimensions.map(function (d) { return convertDistance$1(d, preset.units, unitsTo, pixelsPerInch); });
    } else {
        return dimensions;
    }
}

function convertDistance$1(dimension, unitsFrom, unitsTo, pixelsPerInch) {
    if ( unitsFrom === void 0 ) unitsFrom = 'px';
    if ( unitsTo === void 0 ) unitsTo = 'px';
    if ( pixelsPerInch === void 0 ) pixelsPerInch = 72;

    return convertLength(dimension, unitsFrom, unitsTo, {
        pixelsPerInch: pixelsPerInch,
        precision: 4,
        roundPixel: true
    });
}

function checkIfHasDimensions(settings) {
    if (!settings.dimensions) 
        { return false; }
    if (typeof settings.dimensions === 'string') 
        { return true; }
    if (Array.isArray(settings.dimensions) && settings.dimensions.length >= 2) 
        { return true; }
    return false;
}

function getParentSize(props, settings) {
    if (!isBrowser()) {
        return [300,150];
    }
    var element = settings.parent || window;
    if (element === window || element === document || element === document.body) {
        return [window.innerWidth,window.innerHeight];
    } else {
        var ref = element.getBoundingClientRect();
        var width = ref.width;
        var height = ref.height;
        return [width,height];
    }
}

function resizeCanvas(props, settings) {
    var width, height;
    var styleWidth, styleHeight;
    var canvasWidth, canvasHeight;
    var browser = isBrowser();
    var dimensions = settings.dimensions;
    var hasDimensions = checkIfHasDimensions(settings);
    var exporting = props.exporting;
    var scaleToFit = hasDimensions ? settings.scaleToFit !== false : false;
    var scaleToView = !exporting && hasDimensions ? settings.scaleToView : true;
    if (!browser) 
        { scaleToFit = (scaleToView = false); }
    var units = settings.units;
    var pixelsPerInch = typeof settings.pixelsPerInch === 'number' && isFinite(settings.pixelsPerInch) ? settings.pixelsPerInch : 72;
    var bleed = defined(settings.bleed, 0);
    var devicePixelRatio = browser ? window.devicePixelRatio : 1;
    var basePixelRatio = scaleToView ? devicePixelRatio : 1;
    var pixelRatio, exportPixelRatio;
    if (typeof settings.pixelRatio === 'number' && isFinite(settings.pixelRatio)) {
        pixelRatio = settings.pixelRatio;
        exportPixelRatio = defined(settings.exportPixelRatio, pixelRatio);
    } else {
        if (hasDimensions) {
            pixelRatio = basePixelRatio;
            exportPixelRatio = defined(settings.exportPixelRatio, 1);
        } else {
            pixelRatio = devicePixelRatio;
            exportPixelRatio = defined(settings.exportPixelRatio, pixelRatio);
        }
    }
    if (typeof settings.maxPixelRatio === 'number' && isFinite(settings.maxPixelRatio)) {
        pixelRatio = Math.min(settings.maxPixelRatio, pixelRatio);
    }
    if (exporting) {
        pixelRatio = exportPixelRatio;
    }
    var ref = getParentSize(props, settings);
    var parentWidth = ref[0];
    var parentHeight = ref[1];
    var trimWidth, trimHeight;
    if (hasDimensions) {
        var result = getDimensionsFromPreset(dimensions, units, pixelsPerInch);
        var highest = Math.max(result[0], result[1]);
        var lowest = Math.min(result[0], result[1]);
        if (settings.orientation) {
            var landscape = settings.orientation === 'landscape';
            width = landscape ? highest : lowest;
            height = landscape ? lowest : highest;
        } else {
            width = result[0];
            height = result[1];
        }
        trimWidth = width;
        trimHeight = height;
        width += bleed * 2;
        height += bleed * 2;
    } else {
        width = parentWidth;
        height = parentHeight;
        trimWidth = width;
        trimHeight = height;
    }
    var realWidth = width;
    var realHeight = height;
    if (hasDimensions && units) {
        realWidth = convertDistance$1(width, units, 'px', pixelsPerInch);
        realHeight = convertDistance$1(height, units, 'px', pixelsPerInch);
    }
    styleWidth = Math.round(realWidth);
    styleHeight = Math.round(realHeight);
    if (scaleToFit && !exporting && hasDimensions) {
        var aspect = width / height;
        var windowAspect = parentWidth / parentHeight;
        var scaleToFitPadding = defined(settings.scaleToFitPadding, 40);
        var maxWidth = Math.round(parentWidth - scaleToFitPadding * 2);
        var maxHeight = Math.round(parentHeight - scaleToFitPadding * 2);
        if (styleWidth > maxWidth || styleHeight > maxHeight) {
            if (windowAspect > aspect) {
                styleHeight = maxHeight;
                styleWidth = Math.round(styleHeight * aspect);
            } else {
                styleWidth = maxWidth;
                styleHeight = Math.round(styleWidth / aspect);
            }
        }
    }
    canvasWidth = scaleToView ? Math.round(pixelRatio * styleWidth) : Math.round(pixelRatio * realWidth);
    canvasHeight = scaleToView ? Math.round(pixelRatio * styleHeight) : Math.round(pixelRatio * realHeight);
    var viewportWidth = scaleToView ? Math.round(styleWidth) : Math.round(realWidth);
    var viewportHeight = scaleToView ? Math.round(styleHeight) : Math.round(realHeight);
    var scaleX = canvasWidth / width;
    var scaleY = canvasHeight / height;
    return {
        bleed: bleed,
        pixelRatio: pixelRatio,
        width: width,
        height: height,
        dimensions: [width,height],
        units: units || 'px',
        scaleX: scaleX,
        scaleY: scaleY,
        pixelsPerInch: pixelsPerInch,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        trimWidth: trimWidth,
        trimHeight: trimHeight,
        styleWidth: styleWidth,
        styleHeight: styleHeight
    };
}

var getCanvasContext_1 = getCanvasContext;
function getCanvasContext (type, opts) {
  if (typeof type !== 'string') {
    throw new TypeError('must specify type string')
  }

  opts = opts || {};

  if (typeof document === 'undefined' && !opts.canvas) {
    return null // check for Node
  }

  var canvas = opts.canvas || document.createElement('canvas');
  if (typeof opts.width === 'number') {
    canvas.width = opts.width;
  }
  if (typeof opts.height === 'number') {
    canvas.height = opts.height;
  }

  var attribs = opts;
  var gl;
  try {
    var names = [ type ];
    // prefix GL contexts
    if (type.indexOf('webgl') === 0) {
      names.push('experimental-' + type);
    }

    for (var i = 0; i < names.length; i++) {
      gl = canvas.getContext(names[i], attribs);
      if (gl) return gl
    }
  } catch (e) {
    gl = null;
  }
  return (gl || null) // ensure null on fail
}

function createCanvasElement() {
    if (!isBrowser()) {
        throw new Error('It appears you are runing from Node.js or a non-browser environment. Try passing in an existing { canvas } interface instead.');
    }
    return document.createElement('canvas');
}

function createCanvas(settings) {
    if ( settings === void 0 ) settings = {};

    var context, canvas;
    var ownsCanvas = false;
    if (settings.canvas !== false) {
        context = settings.context;
        if (!context || typeof context === 'string') {
            var newCanvas = settings.canvas;
            if (!newCanvas) {
                newCanvas = createCanvasElement();
                ownsCanvas = true;
            }
            var type = context || '2d';
            if (typeof newCanvas.getContext !== 'function') {
                throw new Error("The specified { canvas } element does not have a getContext() function, maybe it is not a <canvas> tag?");
            }
            context = getCanvasContext_1(type, objectAssign({}, settings.attributes, {
                canvas: newCanvas
            }));
            if (!context) {
                throw new Error(("Failed at canvas.getContext('" + type + "') - the browser may not support this context, or a different context may already be in use with this canvas."));
            }
        }
        canvas = context.canvas;
        if (settings.canvas && canvas !== settings.canvas) {
            throw new Error('The { canvas } and { context } settings must point to the same underlying canvas element');
        }
        if (settings.pixelated) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.oImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            canvas.style['image-rendering'] = 'pixelated';
        }
    }
    return {
        canvas: canvas,
        context: context,
        ownsCanvas: ownsCanvas
    };
}

var SketchManager = function SketchManager() {
    var this$1 = this;

    this._settings = {};
    this._props = {};
    this._sketch = undefined;
    this._raf = null;
    this._recordTimeout = null;
    this._lastRedrawResult = undefined;
    this._isP5Resizing = false;
    this._keyboardShortcuts = keyboardShortcuts({
        enabled: function () { return this$1.settings.hotkeys !== false; },
        save: function (ev) {
            if (ev.shiftKey) {
                if (this$1.props.recording) {
                    this$1.endRecord();
                    this$1.run();
                } else 
                    { this$1.record(); }
            } else if (!this$1.props.recording) {
                this$1.exportFrame();
            }
        },
        togglePlay: function () {
            if (this$1.props.playing) 
                { this$1.pause(); }
             else 
                { this$1.play(); }
        },
        commit: function (ev) {
            this$1.exportFrame({
                commit: true
            });
        }
    });
    this._animateHandler = (function () { return this$1.animate(); });
    this._resizeHandler = (function () {
        var changed = this$1.resize();
        if (changed) {
            this$1.render();
        }
    });
};

var prototypeAccessors = { sketch: { configurable: true },settings: { configurable: true },props: { configurable: true } };
prototypeAccessors.sketch.get = function () {
    return this._sketch;
};
prototypeAccessors.settings.get = function () {
    return this._settings;
};
prototypeAccessors.props.get = function () {
    return this._props;
};
SketchManager.prototype._computePlayhead = function _computePlayhead (currentTime, duration) {
    var hasDuration = typeof duration === "number" && isFinite(duration);
    return hasDuration ? currentTime / duration : 0;
};
SketchManager.prototype._computeFrame = function _computeFrame (playhead, time, totalFrames, fps) {
    return isFinite(totalFrames) && totalFrames > 1 ? Math.floor(playhead * (totalFrames - 1)) : Math.floor(fps * time);
};
SketchManager.prototype._computeCurrentFrame = function _computeCurrentFrame () {
    return this._computeFrame(this.props.playhead, this.props.time, this.props.totalFrames, this.props.fps);
};
SketchManager.prototype._getSizeProps = function _getSizeProps () {
    var props = this.props;
    return {
        width: props.width,
        height: props.height,
        pixelRatio: props.pixelRatio,
        canvasWidth: props.canvasWidth,
        canvasHeight: props.canvasHeight,
        viewportWidth: props.viewportWidth,
        viewportHeight: props.viewportHeight
    };
};
SketchManager.prototype.run = function run () {
    if (!this.sketch) 
        { throw new Error("should wait until sketch is loaded before trying to play()"); }
    if (this.settings.playing !== false) {
        this.play();
    }
    if (typeof this.sketch.dispose === "function") {
        console.warn("In canvas-sketch@0.0.23 the dispose() event has been renamed to unload()");
    }
    if (!this.props.started) {
        this._signalBegin();
        this.props.started = true;
    }
    this.tick();
    this.render();
    return this;
};
SketchManager.prototype._cancelTimeouts = function _cancelTimeouts () {
    if (this._raf != null && typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(this._raf);
        this._raf = null;
    }
    if (this._recordTimeout != null) {
        clearTimeout(this._recordTimeout);
        this._recordTimeout = null;
    }
};
SketchManager.prototype.play = function play () {
    var animate = this.settings.animate;
    if ("animation" in this.settings) {
        animate = true;
        console.warn("[canvas-sketch] { animation } has been renamed to { animate }");
    }
    if (!animate) 
        { return; }
    if (!isBrowser()) {
        console.error("[canvas-sketch] WARN: Using { animate } in Node.js is not yet supported");
        return;
    }
    if (this.props.playing) 
        { return; }
    if (!this.props.started) {
        this._signalBegin();
        this.props.started = true;
    }
    this.props.playing = true;
    this._cancelTimeouts();
    this._lastTime = browser();
    this._raf = window.requestAnimationFrame(this._animateHandler);
};
SketchManager.prototype.pause = function pause () {
    if (this.props.recording) 
        { this.endRecord(); }
    this.props.playing = false;
    this._cancelTimeouts();
};
SketchManager.prototype.togglePlay = function togglePlay () {
    if (this.props.playing) 
        { this.pause(); }
     else 
        { this.play(); }
};
SketchManager.prototype.stop = function stop () {
    this.pause();
    this.props.frame = 0;
    this.props.playhead = 0;
    this.props.time = 0;
    this.props.deltaTime = 0;
    this.props.started = false;
    this.render();
};
SketchManager.prototype.record = function record () {
        var this$1 = this;

    if (this.props.recording) 
        { return; }
    if (!isBrowser()) {
        console.error("[canvas-sketch] WARN: Recording from Node.js is not yet supported");
        return;
    }
    this.stop();
    this.props.playing = true;
    this.props.recording = true;
    var exportOpts = this._createExportOptions({
        sequence: true
    });
    var frameInterval = 1 / this.props.fps;
    this._cancelTimeouts();
    var tick = function () {
        if (!this$1.props.recording) 
            { return Promise.resolve(); }
        this$1.props.deltaTime = frameInterval;
        this$1.tick();
        return this$1.exportFrame(exportOpts).then(function () {
            if (!this$1.props.recording) 
                { return; }
            this$1.props.deltaTime = 0;
            this$1.props.frame++;
            if (this$1.props.frame < this$1.props.totalFrames) {
                this$1.props.time += frameInterval;
                this$1.props.playhead = this$1._computePlayhead(this$1.props.time, this$1.props.duration);
                this$1._recordTimeout = setTimeout(tick, 0);
            } else {
                console.log("Finished recording");
                this$1._signalEnd();
                this$1.endRecord();
                this$1.stop();
                this$1.run();
            }
        });
    };
    if (!this.props.started) {
        this._signalBegin();
        this.props.started = true;
    }
    if (this.sketch && typeof this.sketch.beginRecord === "function") {
        this._wrapContextScale(function (props) { return this$1.sketch.beginRecord(props); });
    }
    streamStart(exportOpts).catch(function (err) {
        console.error(err);
    }).then(function (response) {
        this$1._raf = window.requestAnimationFrame(tick);
    });
};
SketchManager.prototype._signalBegin = function _signalBegin () {
        var this$1 = this;

    if (this.sketch && typeof this.sketch.begin === "function") {
        this._wrapContextScale(function (props) { return this$1.sketch.begin(props); });
    }
};
SketchManager.prototype._signalEnd = function _signalEnd () {
        var this$1 = this;

    if (this.sketch && typeof this.sketch.end === "function") {
        this._wrapContextScale(function (props) { return this$1.sketch.end(props); });
    }
};
SketchManager.prototype.endRecord = function endRecord () {
        var this$1 = this;

    var wasRecording = this.props.recording;
    this._cancelTimeouts();
    this.props.recording = false;
    this.props.deltaTime = 0;
    this.props.playing = false;
    return streamEnd().catch(function (err) {
        console.error(err);
    }).then(function () {
        if (wasRecording && this$1.sketch && typeof this$1.sketch.endRecord === "function") {
            this$1._wrapContextScale(function (props) { return this$1.sketch.endRecord(props); });
        }
    });
};
SketchManager.prototype._createExportOptions = function _createExportOptions (opt) {
        if ( opt === void 0 ) opt = {};

    return {
        sequence: opt.sequence,
        save: opt.save,
        fps: this.props.fps,
        frame: opt.sequence ? this.props.frame : undefined,
        file: this.settings.file,
        name: this.settings.name,
        prefix: this.settings.prefix,
        suffix: this.settings.suffix,
        encoding: this.settings.encoding,
        encodingQuality: this.settings.encodingQuality,
        timeStamp: opt.timeStamp || getTimeStamp(),
        totalFrames: isFinite(this.props.totalFrames) ? Math.max(0, this.props.totalFrames) : 1000
    };
};
SketchManager.prototype.exportFrame = function exportFrame (opt) {
        var this$1 = this;
        if ( opt === void 0 ) opt = {};

    if (!this.sketch) 
        { return Promise.all([]); }
    if (typeof this.sketch.preExport === "function") {
        this.sketch.preExport();
    }
    var exportOpts = this._createExportOptions(opt);
    var client = getClientAPI();
    var p = Promise.resolve();
    if (client && opt.commit && typeof client.commit === "function") {
        var commitOpts = objectAssign({}, exportOpts);
        var hash = client.commit(commitOpts);
        if (isPromise_1(hash)) 
            { p = hash; }
         else 
            { p = Promise.resolve(hash); }
    }
    return p.then(function (hash) { return this$1._doExportFrame(objectAssign({}, exportOpts, {
        hash: hash || ""
    })); }).then(function (result) {
        if (result.length === 1) 
            { return result[0]; }
         else 
            { return result; }
    });
};
SketchManager.prototype._doExportFrame = function _doExportFrame (exportOpts) {
        var this$1 = this;
        if ( exportOpts === void 0 ) exportOpts = {};

    this._props.exporting = true;
    this.resize();
    var drawResult = this.render();
    var canvas = this.props.canvas;
    if (typeof drawResult === "undefined") {
        drawResult = [canvas];
    }
    drawResult = [].concat(drawResult).filter(Boolean);
    drawResult = drawResult.map(function (result) {
        var hasDataObject = typeof result === "object" && result && ("data" in result || "dataURL" in result);
        var data = hasDataObject ? result.data : result;
        var opts = hasDataObject ? objectAssign({}, result, {
            data: data
        }) : {
            data: data
        };
        if (isCanvas(data)) {
            var encoding = opts.encoding || exportOpts.encoding;
            var encodingQuality = defined(opts.encodingQuality, exportOpts.encodingQuality, 0.95);
            var ref = exportCanvas(data, {
                encoding: encoding,
                encodingQuality: encodingQuality
            });
                var dataURL = ref.dataURL;
                var extension = ref.extension;
                var type = ref.type;
            return Object.assign(opts, {
                dataURL: dataURL,
                extension: extension,
                type: type
            });
        } else {
            return opts;
        }
    });
    this._props.exporting = false;
    this.resize();
    this.render();
    return Promise.all(drawResult.map(function (result, i, layerList) {
        var curOpt = objectAssign({
            extension: "",
            prefix: "",
            suffix: ""
        }, exportOpts, result, {
            layer: i,
            totalLayers: layerList.length
        });
        var saveParam = exportOpts.save === false ? false : result.save;
        curOpt.save = saveParam !== false;
        curOpt.filename = resolveFilename(curOpt);
        delete curOpt.encoding;
        delete curOpt.encodingQuality;
        for (var k in curOpt) {
            if (typeof curOpt[k] === "undefined") 
                { delete curOpt[k]; }
        }
        var savePromise = Promise.resolve({});
        if (curOpt.save) {
            var data = curOpt.data;
            if (curOpt.dataURL) {
                var dataURL = curOpt.dataURL;
                savePromise = saveDataURL(dataURL, curOpt);
            } else {
                savePromise = saveFile(data, curOpt);
            }
        }
        return savePromise.then(function (saveResult) { return Object.assign({}, curOpt, saveResult); });
    })).then(function (ev) {
        var savedEvents = ev.filter(function (e) { return e.save; });
        if (savedEvents.length > 0) {
            var eventWithOutput = savedEvents.find(function (e) { return e.outputName; });
            var isClient = savedEvents.some(function (e) { return e.client; });
            var isStreaming = savedEvents.some(function (e) { return e.stream; });
            var item;
            if (savedEvents.length > 1) 
                { item = savedEvents.length; }
             else if (eventWithOutput) 
                { item = (eventWithOutput.outputName) + "/" + (savedEvents[0].filename); }
             else 
                { item = "" + (savedEvents[0].filename); }
            var ofSeq = "";
            if (exportOpts.sequence) {
                var hasTotalFrames = isFinite(this$1.props.totalFrames);
                ofSeq = hasTotalFrames ? (" (frame " + (exportOpts.frame + 1) + " / " + (this$1.props.totalFrames) + ")") : (" (frame " + (exportOpts.frame) + ")");
            } else if (savedEvents.length > 1) {
                ofSeq = " files";
            }
            var client = isClient ? "canvas-sketch-cli" : "canvas-sketch";
            var action = isStreaming ? "Streaming into" : "Exported";
            console.log(("%c[" + client + "]%c " + action + " %c" + item + "%c" + ofSeq), "color: #8e8e8e;", "color: initial;", "font-weight: bold;", "font-weight: initial;");
        }
        if (typeof this$1.sketch.postExport === "function") {
            this$1.sketch.postExport();
        }
        return ev;
    });
};
SketchManager.prototype._wrapContextScale = function _wrapContextScale (cb) {
    this._preRender();
    cb(this.props);
    this._postRender();
};
SketchManager.prototype._preRender = function _preRender () {
    var props = this.props;
    if (is2DContext(props.context) && !props.p5) {
        props.context.save();
        if (this.settings.scaleContext !== false) {
            props.context.scale(props.scaleX, props.scaleY);
        }
    } else if (props.p5) {
        props.p5.scale(props.scaleX / props.pixelRatio, props.scaleY / props.pixelRatio);
    }
};
SketchManager.prototype._postRender = function _postRender () {
    var props = this.props;
    if (is2DContext(props.context) && !props.p5) {
        props.context.restore();
    }
    if (props.gl && this.settings.flush !== false && !props.p5) {
        props.gl.flush();
    }
};
SketchManager.prototype.tick = function tick () {
    if (this.sketch && typeof this.sketch.tick === "function") {
        this._preRender();
        this.sketch.tick(this.props);
        this._postRender();
    }
};
SketchManager.prototype.render = function render () {
    if (this.props.p5) {
        this._lastRedrawResult = undefined;
        this.props.p5.redraw();
        return this._lastRedrawResult;
    } else {
        return this.submitDrawCall();
    }
};
SketchManager.prototype.submitDrawCall = function submitDrawCall () {
    if (!this.sketch) 
        { return; }
    var props = this.props;
    this._preRender();
    var drawResult;
    if (typeof this.sketch === "function") {
        drawResult = this.sketch(props);
    } else if (typeof this.sketch.render === "function") {
        drawResult = this.sketch.render(props);
    }
    this._postRender();
    return drawResult;
};
SketchManager.prototype.update = function update (opt) {
        var this$1 = this;
        if ( opt === void 0 ) opt = {};

    var notYetSupported = ["animate"];
    Object.keys(opt).forEach(function (key) {
        if (notYetSupported.indexOf(key) >= 0) {
            throw new Error(("Sorry, the { " + key + " } option is not yet supported with update()."));
        }
    });
    var oldCanvas = this._settings.canvas;
    var oldContext = this._settings.context;
    for (var key in opt) {
        var value = opt[key];
        if (typeof value !== "undefined") {
            this$1._settings[key] = value;
        }
    }
    var timeOpts = Object.assign({}, this._settings, opt);
    if ("time" in opt && "frame" in opt) 
        { throw new Error("You should specify { time } or { frame } but not both"); }
     else if ("time" in opt) 
        { delete timeOpts.frame; }
     else if ("frame" in opt) 
        { delete timeOpts.time; }
    if ("duration" in opt && "totalFrames" in opt) 
        { throw new Error("You should specify { duration } or { totalFrames } but not both"); }
     else if ("duration" in opt) 
        { delete timeOpts.totalFrames; }
     else if ("totalFrames" in opt) 
        { delete timeOpts.duration; }
    if ("data" in opt) 
        { this._props.data = opt.data; }
    var timeProps = this.getTimeProps(timeOpts);
    Object.assign(this._props, timeProps);
    if (oldCanvas !== this._settings.canvas || oldContext !== this._settings.context) {
        var ref = createCanvas(this._settings);
            var canvas = ref.canvas;
            var context = ref.context;
        this.props.canvas = canvas;
        this.props.context = context;
        this._setupGLKey();
        this._appendCanvasIfNeeded();
    }
    if (opt.p5 && typeof opt.p5 !== "function") {
        this.props.p5 = opt.p5;
        this.props.p5.draw = (function () {
            if (this$1._isP5Resizing) 
                { return; }
            this$1._lastRedrawResult = this$1.submitDrawCall();
        });
    }
    if ("playing" in opt) {
        if (opt.playing) 
            { this.play(); }
         else 
            { this.pause(); }
    }
    checkSettings(this._settings);
    this.resize();
    this.render();
    return this.props;
};
SketchManager.prototype.resize = function resize () {
    var oldSizes = this._getSizeProps();
    var settings = this.settings;
    var props = this.props;
    var newProps = resizeCanvas(props, settings);
    Object.assign(this._props, newProps);
    var ref = this.props;
        var pixelRatio = ref.pixelRatio;
        var canvasWidth = ref.canvasWidth;
        var canvasHeight = ref.canvasHeight;
        var styleWidth = ref.styleWidth;
        var styleHeight = ref.styleHeight;
    var canvas = this.props.canvas;
    if (canvas && settings.resizeCanvas !== false) {
        if (props.p5) {
            if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
                this._isP5Resizing = true;
                props.p5.pixelDensity(pixelRatio);
                props.p5.resizeCanvas(canvasWidth / pixelRatio, canvasHeight / pixelRatio, false);
                this._isP5Resizing = false;
            }
        } else {
            if (canvas.width !== canvasWidth) 
                { canvas.width = canvasWidth; }
            if (canvas.height !== canvasHeight) 
                { canvas.height = canvasHeight; }
        }
        if (isBrowser() && settings.styleCanvas !== false) {
            canvas.style.width = styleWidth + "px";
            canvas.style.height = styleHeight + "px";
        }
    }
    var newSizes = this._getSizeProps();
    var changed = !deepEqual_1(oldSizes, newSizes);
    if (changed) {
        this._sizeChanged();
    }
    return changed;
};
SketchManager.prototype._sizeChanged = function _sizeChanged () {
    if (this.sketch && typeof this.sketch.resize === "function") {
        this.sketch.resize(this.props);
    }
};
SketchManager.prototype.animate = function animate () {
    if (!this.props.playing) 
        { return; }
    if (!isBrowser()) {
        console.error("[canvas-sketch] WARN: Animation in Node.js is not yet supported");
        return;
    }
    this._raf = window.requestAnimationFrame(this._animateHandler);
    var now = browser();
    var fps = this.props.fps;
    var frameIntervalMS = 1000 / fps;
    var deltaTimeMS = now - this._lastTime;
    var duration = this.props.duration;
    var hasDuration = typeof duration === "number" && isFinite(duration);
    var isNewFrame = true;
    var playbackRate = this.settings.playbackRate;
    if (playbackRate === "fixed") {
        deltaTimeMS = frameIntervalMS;
    } else if (playbackRate === "throttle") {
        if (deltaTimeMS > frameIntervalMS) {
            now = now - deltaTimeMS % frameIntervalMS;
            this._lastTime = now;
        } else {
            isNewFrame = false;
        }
    } else {
        this._lastTime = now;
    }
    var deltaTime = deltaTimeMS / 1000;
    var newTime = this.props.time + deltaTime * this.props.timeScale;
    if (newTime < 0 && hasDuration) {
        newTime = duration + newTime;
    }
    var isFinished = false;
    var isLoopStart = false;
    var looping = this.settings.loop !== false;
    if (hasDuration && newTime >= duration) {
        if (looping) {
            isNewFrame = true;
            newTime = newTime % duration;
            isLoopStart = true;
        } else {
            isNewFrame = false;
            newTime = duration;
            isFinished = true;
        }
        this._signalEnd();
    }
    if (isNewFrame) {
        this.props.deltaTime = deltaTime;
        this.props.time = newTime;
        this.props.playhead = this._computePlayhead(newTime, duration);
        var lastFrame = this.props.frame;
        this.props.frame = this._computeCurrentFrame();
        if (isLoopStart) 
            { this._signalBegin(); }
        if (lastFrame !== this.props.frame) 
            { this.tick(); }
        this.render();
        this.props.deltaTime = 0;
    }
    if (isFinished) {
        this.pause();
    }
};
SketchManager.prototype.dispatch = function dispatch (cb) {
    if (typeof cb !== "function") 
        { throw new Error("must pass function into dispatch()"); }
    cb(this.props);
    this.render();
};
SketchManager.prototype.mount = function mount () {
    this._appendCanvasIfNeeded();
};
SketchManager.prototype.unmount = function unmount () {
    if (isBrowser()) {
        window.removeEventListener("resize", this._resizeHandler);
        this._keyboardShortcuts.detach();
    }
    if (this.props.canvas.parentElement) {
        this.props.canvas.parentElement.removeChild(this.props.canvas);
    }
};
SketchManager.prototype._appendCanvasIfNeeded = function _appendCanvasIfNeeded () {
    if (!isBrowser()) 
        { return; }
    if (this.settings.parent !== false && this.props.canvas && !this.props.canvas.parentElement) {
        var defaultParent = this.settings.parent || document.body;
        defaultParent.appendChild(this.props.canvas);
    }
};
SketchManager.prototype._setupGLKey = function _setupGLKey () {
    if (this.props.context) {
        if (isWebGLContext(this.props.context)) {
            this._props.gl = this.props.context;
        } else {
            delete this._props.gl;
        }
    }
};
SketchManager.prototype.getTimeProps = function getTimeProps (settings) {
        if ( settings === void 0 ) settings = {};

    var duration = settings.duration;
    var totalFrames = settings.totalFrames;
    var timeScale = defined(settings.timeScale, 1);
    var fps = defined(settings.fps, 24);
    var hasDuration = typeof duration === "number" && isFinite(duration);
    var hasTotalFrames = typeof totalFrames === "number" && isFinite(totalFrames);
    var totalFramesFromDuration = hasDuration ? Math.floor(fps * duration) : undefined;
    var durationFromTotalFrames = hasTotalFrames ? totalFrames / fps : undefined;
    if (hasDuration && hasTotalFrames && totalFramesFromDuration !== totalFrames) {
        throw new Error("You should specify either duration or totalFrames, but not both. Or, they must match exactly.");
    }
    if (typeof settings.dimensions === "undefined" && typeof settings.units !== "undefined") {
        console.warn("You've specified a { units } setting but no { dimension }, so the units will be ignored.");
    }
    totalFrames = defined(totalFrames, totalFramesFromDuration, Infinity);
    duration = defined(duration, durationFromTotalFrames, Infinity);
    var startTime = settings.time;
    var startFrame = settings.frame;
    var hasStartTime = typeof startTime === "number" && isFinite(startTime);
    var hasStartFrame = typeof startFrame === "number" && isFinite(startFrame);
    var time = 0;
    var frame = 0;
    var playhead = 0;
    if (hasStartTime && hasStartFrame) {
        throw new Error("You should specify either start frame or time, but not both.");
    } else if (hasStartTime) {
        time = startTime;
        playhead = this._computePlayhead(time, duration);
        frame = this._computeFrame(playhead, time, totalFrames, fps);
    } else if (hasStartFrame) {
        frame = startFrame;
        time = frame / fps;
        playhead = this._computePlayhead(time, duration);
    }
    return {
        playhead: playhead,
        time: time,
        frame: frame,
        duration: duration,
        totalFrames: totalFrames,
        fps: fps,
        timeScale: timeScale
    };
};
SketchManager.prototype.setup = function setup (settings) {
        var this$1 = this;
        if ( settings === void 0 ) settings = {};

    if (this.sketch) 
        { throw new Error("Multiple setup() calls not yet supported."); }
    this._settings = Object.assign({}, settings, this._settings);
    checkSettings(this._settings);
    var ref = createCanvas(this._settings);
        var context = ref.context;
        var canvas = ref.canvas;
    var timeProps = this.getTimeProps(this._settings);
    this._props = Object.assign({}, timeProps,
        {canvas: canvas,
        context: context,
        deltaTime: 0,
        started: false,
        exporting: false,
        playing: false,
        recording: false,
        settings: this.settings,
        data: this.settings.data,
        render: function () { return this$1.render(); },
        togglePlay: function () { return this$1.togglePlay(); },
        dispatch: function (cb) { return this$1.dispatch(cb); },
        tick: function () { return this$1.tick(); },
        resize: function () { return this$1.resize(); },
        update: function (opt) { return this$1.update(opt); },
        exportFrame: function (opt) { return this$1.exportFrame(opt); },
        record: function () { return this$1.record(); },
        play: function () { return this$1.play(); },
        pause: function () { return this$1.pause(); },
        stop: function () { return this$1.stop(); }});
    this._setupGLKey();
    this.resize();
};
SketchManager.prototype.loadAndRun = function loadAndRun (canvasSketch, newSettings) {
        var this$1 = this;

    return this.load(canvasSketch, newSettings).then(function () {
        this$1.run();
        return this$1;
    });
};
SketchManager.prototype.unload = function unload () {
        var this$1 = this;

    this.pause();
    if (!this.sketch) 
        { return; }
    if (typeof this.sketch.unload === "function") {
        this._wrapContextScale(function (props) { return this$1.sketch.unload(props); });
    }
    this._sketch = null;
};
SketchManager.prototype.destroy = function destroy () {
    this.unload();
    this.unmount();
};
SketchManager.prototype.load = function load (createSketch, newSettings) {
        var this$1 = this;

    if (typeof createSketch !== "function") {
        throw new Error("The function must take in a function as the first parameter. Example:\n  canvasSketcher(() => { ... }, settings)");
    }
    if (this.sketch) {
        this.unload();
    }
    if (typeof newSettings !== "undefined") {
        this.update(newSettings);
    }
    this._preRender();
    var preload = Promise.resolve();
    if (this.settings.p5) {
        if (!isBrowser()) {
            throw new Error("[canvas-sketch] ERROR: Using p5.js in Node.js is not supported");
        }
        preload = new Promise(function (resolve) {
            var P5Constructor = this$1.settings.p5;
            var preload;
            if (P5Constructor.p5) {
                preload = P5Constructor.preload;
                P5Constructor = P5Constructor.p5;
            }
            var p5Sketch = function (p5) {
                if (preload) 
                    { p5.preload = (function () { return preload(p5); }); }
                p5.setup = (function () {
                    var props = this$1.props;
                    var isGL = this$1.settings.context === "webgl";
                    var renderer = isGL ? p5.WEBGL : p5.P2D;
                    p5.noLoop();
                    p5.pixelDensity(props.pixelRatio);
                    p5.createCanvas(props.viewportWidth, props.viewportHeight, renderer);
                    if (isGL && this$1.settings.attributes) {
                        p5.setAttributes(this$1.settings.attributes);
                    }
                    this$1.update({
                        p5: p5,
                        canvas: p5.canvas,
                        context: p5._renderer.drawingContext
                    });
                    resolve();
                });
            };
            if (typeof P5Constructor === "function") {
                new P5Constructor(p5Sketch);
            } else {
                if (typeof window.createCanvas !== "function") {
                    throw new Error("{ p5 } setting is passed but can't find p5.js in global (window) scope. Maybe you did not create it globally?\nnew p5(); // <-- attaches to global scope");
                }
                p5Sketch(window);
            }
        });
    }
    return preload.then(function () {
        var loader = createSketch(this$1.props);
        if (!isPromise_1(loader)) {
            loader = Promise.resolve(loader);
        }
        return loader;
    }).then(function (sketch) {
        if (!sketch) 
            { sketch = {}; }
        this$1._sketch = sketch;
        if (isBrowser()) {
            this$1._keyboardShortcuts.attach();
            window.addEventListener("resize", this$1._resizeHandler);
        }
        this$1._postRender();
        this$1._sizeChanged();
        return this$1;
    }).catch(function (err) {
        console.warn("Could not start sketch, the async loading function rejected with an error:\n    Error: " + err.message);
        throw err;
    });
};

Object.defineProperties( SketchManager.prototype, prototypeAccessors );

var CACHE = 'hot-id-cache';
var runtimeCollisions = [];
function isHotReload() {
    var client = getClientAPI();
    return client && client.hot;
}

function cacheGet(id) {
    var client = getClientAPI();
    if (!client) 
        { return undefined; }
    client[CACHE] = client[CACHE] || {};
    return client[CACHE][id];
}

function cachePut(id, data) {
    var client = getClientAPI();
    if (!client) 
        { return undefined; }
    client[CACHE] = client[CACHE] || {};
    client[CACHE][id] = data;
}

function getTimeProp(oldManager, newSettings) {
    return newSettings.animate ? {
        time: oldManager.props.time
    } : undefined;
}

function canvasSketch(sketch, settings) {
    if ( settings === void 0 ) settings = {};

    if (settings.p5) {
        if (settings.canvas || settings.context && typeof settings.context !== 'string') {
            throw new Error("In { p5 } mode, you can't pass your own canvas or context, unless the context is a \"webgl\" or \"2d\" string");
        }
        var context = typeof settings.context === 'string' ? settings.context : false;
        settings = Object.assign({}, settings, {
            canvas: false,
            context: context
        });
    }
    var isHot = isHotReload();
    var hotID;
    if (isHot) {
        hotID = defined(settings.id, '$__DEFAULT_CANVAS_SKETCH_ID__$');
    }
    var isInjecting = isHot && typeof hotID === 'string';
    if (isInjecting && runtimeCollisions.includes(hotID)) {
        console.warn("Warning: You have multiple calls to canvasSketch() in --hot mode. You must pass unique { id } strings in settings to enable hot reload across multiple sketches. ", hotID);
        isInjecting = false;
    }
    var preload = Promise.resolve();
    if (isInjecting) {
        runtimeCollisions.push(hotID);
        var previousData = cacheGet(hotID);
        if (previousData) {
            var next = function () {
                var newProps = getTimeProp(previousData.manager, settings);
                previousData.manager.destroy();
                return newProps;
            };
            preload = previousData.load.then(next).catch(next);
        }
    }
    return preload.then(function (newProps) {
        var manager = new SketchManager();
        var result;
        if (sketch) {
            settings = Object.assign({}, settings, newProps);
            manager.setup(settings);
            manager.mount();
            result = manager.loadAndRun(sketch);
        } else {
            result = Promise.resolve(manager);
        }
        if (isInjecting) {
            cachePut(hotID, {
                load: result,
                manager: manager
            });
        }
        return result;
    });
}

canvasSketch.canvasSketch = canvasSketch;
canvasSketch.PaperSizes = paperSizes;

export default canvasSketch;
//# sourceMappingURL=canvas-sketch.m.js.map
