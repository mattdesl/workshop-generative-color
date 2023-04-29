import * as path from "https://deno.land/std@0.181.0/path/mod.ts";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

export default function list(opts = {}) {
  const {} = opts;
  return (ctx) => {
    const listRaw = Deno.readTextFileSync(
      path.resolve(__dirname, "client/list.html")
    );

    const files = [];
    if (opts.entryDir) {
      for (const e of Deno.readDirSync(path.resolve(opts.entryDir))) {
        const name = e.name;
        if (/\.js$/i.test(name) && e.isFile) {
          files.push(path.basename(name, path.extname(name)));
        }
      }
    }

    files.sort((a, b) => parseInt(a) - parseInt(b));

    const entries = files
      .map(
        (f) =>
          `<div class='entry'>
            <a href="${encodeURI("/view/" + f)}">${f}</a>
          </div>`
      )
      .join("");
    const list = listRaw
      .replace("{{title}}", opts.title || "view")
      .replace("{{entries}}", entries);
    ctx.response.type = "text/html; charset=utf-8";
    ctx.response.status = 200;
    ctx.response.body = list;
  };
}
