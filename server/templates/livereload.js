const errPopupId = Symbol.for("inku/error");
const cssPopupId = Symbol.for("inku/css");

const css = `
.error-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.85);
}
.error-box {
  padding: 20px;
  font: 14px monospace;
  box-sizing: border-box;
  border-radius: 4px;
}
.error-text pre {
  color: #e31919;
}
.error-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}
.error-note {
  color: forestgreen;
}
.error-loc {
  font-size: 12px;
  font-style: italic;
  color: hsl(0%, 0%, 50%);
}`;

const errorToHTML = (error) => {
  let html = error.message;
  if (error.errors) {
    const errorDivs = error.errors
      .map((err) => {
        const notes = err.notes
          ? err.notes.map(note => `<div class='error-note'><pre>${note.text}</pre></div>`).join('\n')
          : "";
        const errMsg = [
          err.location.line > 1 ? "..." : "",
          err.location.lineText,
          Array(err.location.column).fill(" ").join("") + "^",
        ]
          .filter(Boolean)
          .join("\n");
        return `<div class='error-box'>
        <div class='error-title'>${err.text}</div>
        <div class='error-loc'>${err.location.file} on line ${err.location.line} column ${err.location.column}</div>
        <div class='error-text'>
          <pre>${errMsg}</pre>
        </div>
        ${notes}
      </div>`;
      })
      .join("\n");
    html = `<div class='error-container'>${errorDivs}</div>`;
  } else {
    html = `<pre>${html}</pre>`;
  }
  return html;
};

const clearPopup = () => {
  const el = window[errPopupId];
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
  window[errPopupId] = null;
};
window.inku = window.inku || {};
window.inku.showError = (error) => {
  if (!window[cssPopupId]) {
    window[cssPopupId] = true;
    const sheet = document.createElement("style");
    sheet.innerHTML = css;
    document.body.appendChild(sheet);
  }
  clearPopup();
  const err = document.createElement("div");
  err.classList.add("inku-error-popup");
  err.innerHTML = errorToHTML(error);
  document.body.appendChild(err);
};
window.onload = () => {
  let socket;
  retry();
  function retry() {
    // console.log('[sasho-client] init')
    socket = new WebSocket(`ws://${window.location.host}/inku/livereload`);
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
