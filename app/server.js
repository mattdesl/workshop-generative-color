import { App } from "@tinyhttp/app";
import sirv from "sirv";
import * as http from "http";
import WebSocket from "ws";

export const LIVE_RELOAD_API = "/livereload";
export const LIVE_RELOAD_SRC = "/livereload.js";

const WebSocketServer = WebSocket.Server;

const liveReloadClient = `window.onload = () => {
  let socket;
  retry();
  function retry() {
    const uri = "ws://" + window.location.host + "/livereload";
    socket = new WebSocket(uri);
    socket.onmessage = (m) => {
      let evt;
      try {
        evt = JSON.parse(m.data);
      } catch (err) {
        return console.error(err);
      }
      if (evt.event === "reload") location.reload();
    };
    socket.onclose = () => {
      setTimeout(retry, 1000);
    };
    return socket;
  }
};`;

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
  const { serveDir = process.cwd(), middleware } = opts;

  const clients = new Set();
  const app = new App({
    onError: (err, req, res) => {
      res
        .status(500)
        .type("html")
        .end(
          `<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #e31919;"><pre style="white-space: pre-wrap;">Server responded with error code 500\n${
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
          `<body style="font-family: monospace; padding: 20px; font-size: 14px; color: #e31919;"><pre style="white-space: pre-wrap;">404 resource not found: ${url}</pre></body>`
        );
    },
  });
  app.use(tinyws());
  app.use(LIVE_RELOAD_API, async (req, res) => {
    if (req.ws) {
      const socket = await req.ws();
      clients.add(socket);
      socket.send(JSON.stringify({ event: "connect" }));
      socket.onmessage = (m) => {
        socket.send(m.data);
      };
      socket.on("close", () => {
        clients.delete(socket);
      });
    } else {
      res.send(
        `${LIVE_RELOAD_API} should be accessed from websocket request, not HTTP`
      );
    }
  });
  app.use(LIVE_RELOAD_SRC, async (req, res) => {
    res.status(200).type("js").send(liveReloadClient);
  });
  if (middleware) {
    app.use(middleware);
  }
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
