# workshop-generative-color

## Editing Online

You can see and edit the demos online in Glitch if you do not want to run it locally:

- [✨ View on Glitch](https://generative-color.glitch.me)
- [🔧 Edit on Glitch](https://glitch.com/edit/#!/generative-color)

## Running Locally

To run locally, you first need to clone and install the project with Node.js and npm, and it will need to be a newer version like `node@16` or higher. You can download Node.js and npm [here](https://nodejs.org).

In terminal, run the following from your desired root folder:

```sh
git clone https://github.com/mattdesl/workshop-generative-color.git

cd workshop-generative-color

npm install
```

Then, start the dev server:

```sh
npm run start
```

Open [http://localhost:9966/](http://localhost:9966/) and start changing exercises in the [sketches/](./sketches/) folder.

## Code & Software

- [colorjs.io](https://colorjs.io)
- [spectral.js](https://github.com/rvanwijnen/spectral.js)
- [mixbox](https://github.com/scrtwpns/mixbox)

## Tools

- [color grab](https://mattdesl.github.io/colorgrab/) — pick colors from an image
- [color swatch](https://mattdesl.github.io/colorswatch/) — a color picker tool across multiple spaces
- [color-spd](https://mattdesl.github.io/color-spd/) — make colors from spectral color distributions

## Color Pickers

- [Google HSV Color Picker](https://g.co/kgs/xoe6Sv)
- [OKLCH and LCH Color Picker](https://oklch.com/)
- [OKHSV and OKHSL Color Picker](https://ok-color-picker.netlify.app/) (related [blog post](https://bottosson.github.io/posts/colorpicker/))
- [HSLuv](https://www.hsluv.org)

## Related Links

- [147 Named CSS Colors](https://147colors.com)
- [Hue Color Models](https://colorsupplyyy.com/app/)
- [Sorted CSS Colors](https://enes.in/sorted-colors/)
- [Color Systems](https://www.colorsystem.com/?lang=en)
- ["It's Time to Learn oklch Color" by Keith J. Grant](https://keithjgrant.com/posts/2023/04/its-time-to-learn-oklch-color/)

## Color Libraries

- [nice-color-palettes](https://github.com/Jam3/nice-color-palettes)
- [chromotome](https://www.npmjs.com/package/chromotome)
- [paper-colors](https://www.npmjs.com/package/paper-colors)
- [riso-colors](https://www.npmjs.com/package/riso-colors)
- [dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations)
- [color-names](https://github.com/meodai/color-names)

## Color Spaces

- [Oklab by Björn Ottosson](https://bottosson.github.io/posts/oklab/)

## License

All code that I have written here is licensed as MIT. Some additional notes:

- The ColorChecker data in `lib/spectra/` is from [here](https://www.rit.edu/science/munsell-color-science-lab-educational-resources), which does not explicitly give a license
- The CIE 1931 2º Standard Observer Color Matching Functions and CIE Standard Illuminants in `lib/spectra` I believe are public domain. They are sourced from [here](https://github.com/geometrian/simple-spectral) and elsewhere. If somebody finds any specific license information please let me know.
- The precomputed CIE 1931 basis BT709 spectra data in `lib/spectra` is MIT under [this repository](https://github.com/geometrian/simple-spectral)
- The vendor scripts in `lib/vendor` are all pulled from MIT licensed packages.
- The oklab conversion math in `lib/oklab.js` is from Björn Ottosson's repo [here](https://github.com/bottosson/bottosson.github.io/blob/master/misc/colorpicker/colorconversion.js) and is MIT licensed
