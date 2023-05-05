import net from "net";
import os from "os";

export const getLocalHosts = () => {
  var interfaces = os.networkInterfaces();
  var addresses = new Set();
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === "IPv4" && !address.internal) {
        addresses.add(address.address);
      }
    }
  }

  return [...addresses];
};

function getPortCb(start, host, cb) {
  const end = 60000;
  if (start >= end) return cb(new Error("out of ports :("));
  var c = net.connect(start, host, function () {
    c.destroy();
    getPortCb(start + 1, host, cb);
  });
  c.on("error", function () {
    cb(null, start);
  });
}

export const getPort = (port, host) =>
  new Promise((resolve, reject) => {
    getPortCb(port, host, (err, p) => {
      if (err) reject(err);
      else resolve(p);
    });
  });
