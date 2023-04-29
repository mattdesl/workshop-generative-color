window.onload = () => {
  let socket;
  retry();
  function retry() {
    // console.log('[sasho-client] init')
    socket = new WebSocket(`ws://${window.location.host}/livereload`);
    socket.onopen = () => {
      // console.log("[sasho-client] connected");
    };
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
      // console.log("[sasho-client] disconnected");
      setTimeout(retry, 1000);
    };
    return socket;
  }
};
