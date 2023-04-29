import * as path from "path";
import { fileURLToPath } from "url";
import builtins from "./shims/node_builtins.js";

const __dirname = fileURLToPath(path.dirname(import.meta.url));
const emptyShim = path.resolve(__dirname, "shims/empty.js");

function isRelativeSpecifier(file) {
  if (file.includes(":")) return false;
  return /^[\/\\\.]/.test(file);
}

export default function nodePlugin(opts = {}) {
  const { cwd = process.cwd() } = opts;
  return {
    name: "node",
    setup(build) {
      build.initialOptions.inject = build.initialOptions.inject || [];
      if (opts.process) {
        const processShim = path.resolve(__dirname, "shims/process_shim.js");
        if (!build.initialOptions.inject.includes(processShim)) {
          build.initialOptions.inject.unshift(processShim);
        }
      }
      if (opts.buffer) {
        const bufferShim = path.resolve(__dirname, "shims/buffer_shim.js");
        if (!build.initialOptions.inject.includes(bufferShim)) {
          build.initialOptions.inject.unshift(bufferShim);
        }
      }

      build.onResolve({ filter: /.*/ }, async (args) => {
        let path = args.path;
        path = path.replace(/^node\:/, "");
        if (builtins.has(path) && args.pluginData !== "builtin") {
          const id = builtins.get(path);
          if (id === null) {
            return {
              path: emptyShim,
            };
          }
          const result = await build.resolve(id, {
            kind: args.kind,
            resolveDir: cwd,
            importer: cwd,
            namespace: args.namespace,
            pluginData: "builtin",
          });
          if (result && result.errors && result.errors.length) {
            const idPkg = id.split("/")[0];
            const errs = result.errors.slice();
            errs[0].text = `Cannot resolve "${path}"`;
            errs[0].notes = [
              {
                location: null,
                text: `To fix, try running the following command:\n  npm install ${idPkg}`,
              },
            ];
            return {
              ...result,
              errors: errs,
            };
          } else if (!result) {
            throw new Error("no resolve result for id " + id);
          }
          return result;
        }
      });
    },
  };
}
