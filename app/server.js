import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import * as path from "https://deno.land/std@0.181.0/path/mod.ts";
import list from "./list.js";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const liveReloadFile = path.fromFileUrl(
  import.meta.resolve("./client/livereload.js")
);
const liveReloadSrc = Deno.readTextFileSync(liveReloadFile);

const htmlIndexSrcRaw = /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>color-workshop</title>
    <script src="/livereload.js" type="module"></script>
  </head>
  <body>
    <div>hi</div>
  </body>
</html>`;

export default function startServer(opts = {}) {
  const {
    port = 9966,
    middleware,
    rootDir = Deno.cwd(),
    entryDir = Deno.cwd(),
  } = opts;

  const buildEntryPoints = [];
  const htmlIndexSrc = htmlIndexSrcRaw.replace(
    "{{entryPoints}}",
    buildEntryPoints.map((src) => {
      return `<script src=${JSON.stringify(src)} type="module"></script>`;
    })
  );

  const app = new Application();
  const router = new Router();
  const clients = new Set();

  router.get("/favicon.ico", (ctx) => {
    ctx.response.type = "text/html";
    ctx.response.status = 200;
    ctx.response.body = htmlIndexSrc;
  });
  router.get("/livereload.js", (ctx) => {
    ctx.response.type = "text/javascript";
    ctx.response.status = 200;
    ctx.response.body = liveReloadSrc;
  });
  // router.get("/", (ctx) => {
  //   ctx.response.type = "text/html";
  //   ctx.response.status = 200;
  //   ctx.response.body = htmlIndexSrc;
  // });
  router.get("/livereload", (ctx) => {
    if (!ctx.isUpgradable) {
      ctx.throw(501);
    }
    const socket = ctx.upgrade();
    socket.onopen = () => {
      // console.log("[sasho-server] connected");
      clients.add(socket);
      socket.send(JSON.stringify({ event: "connect" }));
    };
    socket.onmessage = (m) => {
      // console.log("message from client", m);
      socket.send(m.data);
    };
    socket.onclose = () => {
      // console.log("[sasho-server] closed");
      clients.delete(socket);
    };
  });

  const sendSketch = (edit) => {
    return (ctx) => {
      let srcFile = path.resolve(
        entryDir,
        decodeURIComponent(
          ctx.request.url.pathname.replace(/^\/(view|edit)\//i, "/sketches/")
        )
      );
      if (!path.extname(srcFile)) srcFile = srcFile + ".js";
      try {
        const fpath = path.resolve(
          __dirname,
          `client/${edit ? "edit" : "sketch"}.html`
        );
        const jsFile = path.basename(srcFile);
        const txt = Deno.readTextFileSync(fpath);
        const src = encodeURI(srcFile);

        // try to stat the file
        Deno.statSync("." + srcFile);

        ctx.response.type = "text/html; charset=utf-8";
        ctx.response.status = 200;
        ctx.response.body = txt
          .replaceAll("{{title}}", jsFile)
          .replaceAll("{{src}}", src)
          .replaceAll(
            "{{srcView}}",
            encodeURI(`/view/${path.basename(jsFile)}`)
          );
      } catch (err) {
        console.error(err);
        const url = src;
        ctx.response.type = "text/html; charset=utf-8";
        ctx.response.status = 404;
        ctx.response.body = `<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #e31919;">404 resource not found: ${url}</body>`;
      }
    };
  };

  router.redirect("/view", "/");
  // router.post("/_edit/change", async (ctx) => {
  //   const body = await ctx.request.body({ type: "json" });
  //   const d = await body.value;
  //   if (d && d.code != null) {
  //     const f = path.resolve(rootDir, "." + d.src);
  //     console.log("write", f);
  //     await Deno.writeTextFile(f, d.code);
  //   }

  //   ctx.response.status = 200;
  //   ctx.response.type = ".json";
  //   ctx.response.body = JSON.stringify({ ok: true });
  // });
  router.get("/", list({ title: "view", entryDir }));
  router.get(/^\/view\/*/i, sendSketch(false));
  // router.get(/^\/edit\/*/i, sendSketch(true));
  app.use(router.routes());
  app.use(router.allowedMethods());

  if (middleware) {
    app.use(middleware);
  }

  // app.use(async (ctx, next) => {
  //   try {
  //     return await ctx.send({
  //       root: rootDir,
  //       index: "index.html",
  //     });
  //   } catch (err) {
  //     console.error("Error sending static content:", err.message);
  //     return await next(err);
  //   }
  // });

  app.use(async (ctx) => {
    const url = ctx.request.url;
    const filepath = decodeURIComponent(url.pathname);

    // Try opening the file
    let file;
    try {
      file = await Deno.open(rootDir + filepath, { read: true });
    } catch (err) {
      console.error("Error reading file", err);
      // If the file cannot be opened, return a "404 Not Found" response
      // ctx.response.type = "text/html; charset=utf-8";
      ctx.response.status = 404;
      // ctx.response.body = `<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #e31919;">404 resource not found: ${url}</body>`;
      throw err;
      // return await next();
    }

    // Build a readable stream so the file doesn't have to be fully loaded into
    // memory while we send it
    const readableStream = file.readable;
    ctx.response.type = path.extname(filepath);
    ctx.response.status = 200;
    ctx.response.body = readableStream;
  });

  app.use((ctx) => {
    console.error("got error handler");
    const url = ctx.request.url.pathname;
    ctx.response.type = "text/html; charset=utf-8";
    ctx.response.status = 404;
    ctx.response.body = `<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #e31919;">404 resource not found: ${url}</body>`;
  });

  app.addEventListener("listen", () => {
    console.log(`Listening on http://localhost:${port}/`);
  });

  return {
    reload() {
      clients.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ event: "reload" }));
        }
      });
    },
    close() {
      clients.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1000);
        }
      });
    },
    listen() {
      return app.listen({ port });
    },
  };
}
