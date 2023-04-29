import { App } from "@tinyhttp/app";
import sirv from "sirv";
import * as path from "path";
import { fileURLToPath, parse as parseUrl } from "url";
import { readFile } from "fs/promises";
import * as http from "http";
import { LIVE_RELOAD_API, LIVE_RELOAD_SRC } from "./config.js";
import { WebSocketServer, WebSocket } from "ws";

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const tinyws =
  (wsOptions, wss = new WebSocketServer({ ...wsOptions, noServer: true })) =>
  async (req, _, next) => {
    const upgradeHeader = (req.headers.upgrade || "")
      .split(",")
      .map((s) => s.trim());

    // When upgrade header contains "websocket" it's index is 0
    if (upgradeHeader.indexOf("websocket") === 0) {
      req.ws = () =>
        new Promise((resolve) => {
          wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
            wss.emit("connection", ws, req);
            resolve(ws);
          });
        });
    }
    await next();
  };

export async function createServer(opts = {}) {
  const {
    serveDir = process.cwd(),
    buildSrc,
    middleware,
    title = "inku",
  } = opts;
  const scriptSources = [LIVE_RELOAD_SRC, buildSrc].filter(Boolean);
  const entryScripts = scriptSources
    .map((src) => {
      return `<script src=${JSON.stringify(src)} type="module"></script>`;
    })
    .join("\n");

  const html = (
    await readFile(path.resolve(__dirname, "templates/index.html"), "utf8")
  )
    .replace("{{entryPoints}}", entryScripts)
    .replace("{{title}}", title);

  const clients = new Set();
  const app = new App({
    onError: (err, req, res) => {
      res
        .status(500)
        .type("html")
        .end(
          `<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #e31919;"><pre>Server responded with error code 500\n${
            err.stack || err.message
          }</pre></body>`
        );
    },
    noMatchHandler: (req, res) => {
      const { url } = req;
      res
        .status(404)
        .type("html")
        .end(
          `<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #e31919;">404 resource not found: ${url}</body>`
        );
    },
  });
  app.use(tinyws());
  app.use(LIVE_RELOAD_API, async (req, res) => {
    if (req.ws) {
      const socket = await req.ws();
      clients.add(socket);
      // console.log("[inku-server] connected");
      socket.send(JSON.stringify({ event: "connect" }));
      socket.onmessage = (m) => {
        // console.log("message from client", m);
        socket.send(m.data);
      };
      socket.on("close", () => {
        // console.log("[inku-server] closed");
        clients.delete(socket);
      });
    } else {
      res.send(
        `${LIVE_RELOAD_API} should be accessed from websocket request, not HTTP`
      );
    }
  });
  app.use(LIVE_RELOAD_SRC, async (req, res) => {
    const text = await readFile(
      path.resolve(__dirname, "templates/livereload.js")
    );
    res.status(200).type("js").send(text);
  });
  if (middleware) {
    app.use(middleware);
  }
  app.use("/", (req, res, next) => {
    const url = parseUrl(req.url).pathname;
    if (/^\/(index.html?)?$/i.test(url)) {
      res.status(200).send(html);
    } else {
      next(null);
    }
  });
  app.use(
    sirv(serveDir, {
      dev: true,
    })
  );

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
    listen(port = 3000, host = undefined) {
      return new Promise((resolve, reject) => {
        const noop = () => {};
        try {
          const server = http
            .createServer()
            .on("request", app.attach)
            .once("error", (err) => {
              reject(err);
              reject = resolve = noop;
            })
            .listen(port, host, () => {
              resolve(server);
              reject = resolve = noop;
            });
        } catch (err) {
          reject(err);
        }
      });
    },
  };
}
