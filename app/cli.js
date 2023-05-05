import { getLocalHosts, getPort } from "./util.js";
import { createServer } from "./server.js";
import * as path from "path";
import { fileURLToPath, parse as parseUrl } from "url";
import fs from "fs/promises";
import watcher from "@parcel/watcher";

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const localhosts = getLocalHosts();
const useWatch = true;

const SERVE_DIR = path.resolve(__dirname, "../");
const SKETCHES_DIR = path.resolve(__dirname, "../sketches/");
const WATCH_DIRS = ["assets", "lib", "sketches"].map((w) =>
  path.resolve(__dirname, "..", w)
);

// use local host
const DEFAULT_PORT = process.env.PORT || 9966;
const host = undefined;
const port = await getPort(DEFAULT_PORT, host);

const app = await createServer({
  title: "color",
  serveDir: SERVE_DIR,
  middleware,
});

if (useWatch) {
  const subscriptions = [];
  for (let dir of WATCH_DIRS) {
    try {
      subscriptions.push(await watcher.subscribe(dir, app.reload));
    } catch (err) {
      console.warn("Watch Error:", err);
    }
  }
}

await app.listen(port, host);

const addresses = ["localhost", ...localhosts];
console.log(
  `Server listening on:\n` +
    [...addresses].map((host) => `  http://${host}:${port}/`).join("\n")
);
console.log();

async function middleware(req, res, next) {
  const url = parseUrl(req.url).pathname;
  if (/^\/(index.html?)?$/i.test(url)) {
    return index(req, res, next);
  } else if (/^\/view\/*/i.test(url)) {
    return view(req, res, next);
  } else {
    return next(null);
  }
}

async function index(req, res, next) {
  let sketches = [];
  try {
    sketches = (await fs.readdir(SKETCHES_DIR)).filter((x) =>
      /\.(js)$/i.test(x)
    );
    sketches.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  } catch (err) {
    console.warn(`Error reading sketches dir, skipped`);
    console.warn(err.message);
  }

  const divs = sketches
    .map(
      (f) =>
        `<div class='entry'>
          <a href="${encodeURI("/view/" + f)}">${f}</a>
        </div>`
    )
    .join("");

  await render(res, {
    title: "color",
    entry: `<main><h2>sketches/</h2>${divs}</main>`,
  });
}

async function view(req, res) {
  let srcFile = decodeURIComponent(
    parseUrl(req.url).pathname.replace(/^\/(view)\//i, "/sketches/")
  );
  if (!path.extname(srcFile)) srcFile = srcFile + ".js";
  const jsFile = path.basename(srcFile);
  return render(res, {
    title: jsFile,
    entry: `<nav class="breadcrumb">
    <a href="/">sketches</a> / ${jsFile}
  </nav>
  <script src="${encodeURI(srcFile)}" type="module"></script>`,
  });
}

async function render(res, opts) {
  const { title = "", entry = "", debug = true } = opts;
  const head = debug
    ? [
        `<script src="/livereload.js" type="module"></script>`,
        `<script src="/lib/vendor/error-help.js"></script>`,
      ].join("\n")
    : "";
  const html = getHTML()
    .replaceAll("{{title}}", title)
    .replace("{{head}}", head)
    .replace("{{entry}}", entry);

  res.status(200).type("html");
  res.send(html);
}

function getHTML() {
  return /*html*/ `<html>
  <head>
    <title>{{title}}</title>
    <meta
      name="viewport"
      content="width=device-width, shrink-to-fit=0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
    />
    <link rel="stylesheet" href="/assets/main.css">
    {{head}}
  </head>
  <body>
    {{entry}}
  </body>
</html>`;
}
