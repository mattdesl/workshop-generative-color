import { getLocalHosts, getPort } from "./util.js";
import { createServer } from "./server.js";
import { createBundler } from "./bundler.js";
import { createWatcher } from "./watcher.js";
import { existsSync } from "fs";
import * as path from "path";

import minimist from "minimist";

const argv = minimist(process.argv.slice(2), {
  boolean: ["new", "open", "buffer", "process"],
  alias: {
    new: "n",
    open: "o",
  },
});
const localhosts = getLocalHosts();
const cwd = process.cwd();
const packageFile = path.resolve(cwd, "package.json");

const defaultExtension = ".js";
if (argv._.length > 1) {
  throw new Error(`error: currently only one entry point supported`);
}

const createNew = argv.new;
let entryPoint = argv._[0];
if (!entryPoint) {
  throw new Error(
    `must specify an entry point, like this:\n  inku my-sketch.js`
  );
}
if (!existsSync(entryPoint)) {
  if (createNew) {
    throw new Error(`--new flag not yet supported`);
  } else {
    const extname = path.extname(entryPoint);
    if (!extname && existsSync(entryPoint + defaultExtension)) {
      entryPoint = entryPoint + defaultExtension;
    } else {
      throw new Error(`Cannot find file ${entryPoint}`);
    }
  }
}

const useWatch = true;

let watcher, bundler, app;
if (useWatch) {
  // in milliseconds
  const debounce = 0;
  let timeout;
  watcher = await createWatcher((err, changes) => {
    if (err) {
      console.warn("Error from file watcher:", err);
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // invalidate the bundler so that the next request will trigger
      // a fresh start
      if (bundler) bundler.invalidate();
      // trigger a reload event to any live connections
      if (app) app.reload();
    }, debounce);
  });

  // watch user package.json for changes
  watcher.watchFile(packageFile);
}

const useBundler = true;
if (useBundler) {
  bundler = await createBundler({
    buffer: argv.buffer,
    process: argv.process,
    entryPoints: [entryPoint],
    applyDependencies: async (deps = []) => {
      // console.log("dependencies", deps);
      if (watcher) {
        await watcher.applyFiles([packageFile, ...deps]);
      }
    },
  });
}

// use local host
const host = undefined;
const port = await getPort(9966, host);

app = await createServer({
  serveDir: cwd,
  buildSrc: bundler ? bundler.src : false,
  middleware: bundler ? bundler.middleware : null,
});

await app.listen(port, host);

const addresses = ["localhost", ...localhosts];
console.log(
  `Server listening on:\n` +
    [...addresses].map((host) => `  http://${host}:${port}/`).join("\n")
);
console.log();

// trigger a new build
if (bundler) bundler.build();
