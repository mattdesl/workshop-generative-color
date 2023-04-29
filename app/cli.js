// deno --unstable run -A src/cli.js examples/rect.js

import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import * as path from "https://deno.land/std@0.181.0/path/mod.ts";
import createServer from "./server.js";
import createWatcher from "./watcher.js";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const argv = parse(Deno.args, {});
// const entryPoints = argv._;
// if (entryPoints.length > 1)
// throw new Error(`error: currently only one entry point supported`);

const cwd = Deno.cwd();
const watchPaths = [cwd];

const sketches = argv.sketches || "sketches";
// const server = Deno.listen({ port: 9966 });

const server = createServer({
  rootDir: cwd,
  entryDir: sketches,
});

// in milliseconds
const debounce = 5;

let timeout;
const watcher = createWatcher(() => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log("change detected");
    // trigger a reload event to any live connections
    server.reload();
  }, debounce);
});

watcher.watch(watchPaths);

// now load server
await server.listen();
