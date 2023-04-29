import * as esbuild from "esbuild";
import * as path from "path";
import { parse as urlParse, fileURLToPath } from "url";
import { BUILD_SRC } from "./config.js";
import nodePlugin from "./plugins/node.js";

const __dirname = fileURLToPath(path.dirname(import.meta.url));

export async function createBundler(opts = {}) {
  const { entryPoints = [], applyDependencies = () => {} } = opts;

  if (entryPoints.length > 1) {
    throw new Error("multiply entries not yet supported");
  }

  const src = BUILD_SRC;
  const entryPoint = entryPoints[0];

  const ctx = await esbuild.context({
    entryPoints: [entryPoint],
    sourcemap: "inline", // TODO: figure out external source maps here
    define: { global: "globalThis" },
    inject: [path.resolve(__dirname, "plugins/inject.js")],
    write: false,
    bundle: true,
    metafile: true,
    outfile: src,
    format: "esm",
    logLevel: "silent",
    treeShaking: false,
    minify: false,
    plugins: [nodePlugin(opts)],
  });

  let dirty = true;
  let cachedState = null;

  const build = () => {
    return ctx.rebuild();
  };

  const getBuildState = async () => {
    // trigger a new build if there is none yet, or if we are hitting the entry again
    if (!cachedState || dirty) {
      try {
        const result = await build();
        cachedState = result;
        dirty = false;
        const deps = Object.keys(result.metafile.inputs).filter(
          (d) => !/^https?\:\/\//i.test(d)
        );
        await applyDependencies(deps);
      } catch (err) {
        // console.error(`Bundle Error:`, err.errors);
        const msg = esbuild.formatMessagesSync(err.errors, {
          kind: "error",
          color: true,
          terminalWidth: process.stdout.width,
        });
        console.error(msg.join("\n"));
        cachedState = { error: err };
      }
    }
    return cachedState;
  };

  return {
    src,
    invalidate() {
      dirty = true;
    },
    build() {
      this.invalidate();
      return getBuildState();
    },
    close() {
      ctx.dispose();
    },
    async middleware(req, res, next) {
      const pathname = (urlParse(req.url).pathname || "").toLowerCase();
      const isEntry = pathname === src;
      const isSourceMap = pathname === `${src}.map`;

      if (isEntry || isSourceMap) {
        const ext = path.extname(pathname);

        // get the latest build state
        const state = await getBuildState();

        const entry = state.outputFiles
          ? state.outputFiles.find(
              (e) => path.extname(e.path).toLowerCase() === ext
            )
          : null;

        if (state.error) {
          const text = state.error.toString();
          const error = {
            message: text,
            errors: state.error.errors,
          };
          // prettier-ignore
          const body = `// Auto-Generated Build Error
console.error(${JSON.stringify(text)});
if (window.inku && window.inku.showError) {
  window.inku.showError(${JSON.stringify(error)});
}`;
          res.status(200).type("js").send(body);
        } else if (entry) {
          const type = isSourceMap ? "application/json" : "text/javascript";
          // if (!isSourceMap) console.log("bytes", entry.text.length);
          res.status(200).type(type).send(entry.text);
        } else {
          throw new Error("build error, no build result");
        }
      } else {
        next(null);
      }
    },
  };
}
