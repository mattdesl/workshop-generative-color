import watcher from "@parcel/watcher";
import * as path from "path";

export function createWatcher(trigger = () => {}) {
  const directories = new Map();

  const getWatchedFiles = () => {
    const files = new Set();
    for (let [dir, r] of directories.entries()) {
      for (let f of r.references) files.add(f);
    }
    return [...files];
  };

  const onEvent = (err, files) => {
    if (err) {
      console.error("Watch Error:", err.message);
    }
    if (files && files.length) {
      const watchingFiles = getWatchedFiles();
      const filtered = files.filter((f) => watchingFiles.includes(f.path));
      if (filtered.length) {
        trigger(err, filtered);
      }
    }
  };

  return {
    getWatchedDirectories() {
      return [...directories.keys()];
    },
    getWatchedFiles,
    async watchFile(file) {
      // resolve normalized file path
      file = path.resolve(file);

      // get dir to watch
      const dir = path.dirname(file);

      // dir isn't being watched, watch it now
      if (!directories.has(dir)) {
        const subscription = await watcher.subscribe(dir, onEvent);
        const references = new Set();
        directories.set(dir, { subscription, references });
      }

      // reference the file
      directories.get(dir).references.add(file);
    },
    async unwatchFile(file) {
      // resolve normalized file path
      file = path.resolve(file);

      // get dir to watch
      const dir = path.dirname(file);

      // dir is being watched
      if (directories.has(dir)) {
        const { references, subscription } = directories.get(dir);
        references.delete(file);

        // no more files left to watch, remove subscription and entry
        if (references.size === 0) {
          await subscription.unsubscribe();
          directories.delete(dir);
        }
      }
    },
    async applyFiles(tree) {
      const currentFiles = this.getWatchedFiles();
      const newFiles = [...new Set(tree.map((t) => path.resolve(t)))];

      // get a list of new files to watch
      const toWatch = newFiles.filter((f) => !currentFiles.includes(f));
      // and a list of files that we no longer need to watch
      const toUnwatch = currentFiles.filter((f) => !newFiles.includes(f));

      // console.log("files to watch:", toWatch);
      // console.log("files to unwatch:", toUnwatch);
      for (let f of toWatch) await this.watchFile(f);
      for (let f of toUnwatch) await this.unwatchFile(f);
    },
    async unwatchAll() {
      for (let r of directories.values()) {
        await r.subscription.unsubscribe();
      }
      directories.clear();
    },
  };
}
