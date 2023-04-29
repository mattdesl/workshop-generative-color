export default function startWatcher(trigger) {
  let watcher = null;
  return {
    close() {
      if (watcher) {
        watcher.close();
        watcher = null;
      }
    },
    async watch(paths) {
      this.close();
      watcher = Deno.watchFs(paths);
      for await (const event of watcher) {
        trigger(event);
      }
    },
  };
}
