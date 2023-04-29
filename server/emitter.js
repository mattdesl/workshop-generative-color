function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];
  list.pop();
}

function spliceObject(list, object) {
  const idx = list.indexOf(object);
  if (idx >= 0) spliceOne(list, idx);
}

export default class Emitter {
  constructor() {
    this._events = {};
  }

  dispose() {
    for (let k in this._events) {
      if (this._events.hasOwnProperty(k)) {
        delete this._events;
      }
    }
    return this;
  }

  on(name, listener) {
    if (!(name in this._events)) {
      this._events[name] = [listener];
    } else {
      this._events[name].push(listener);
    }
    return this;
  }

  off(name, listener) {
    if (name in this._events) {
      spliceObject(this._events[name], listener);
    }
    return this;
  }

  emit(name, ev) {
    if (name in this._events) {
      const array = this._events[name];
      for (let i = 0; i < array.length; i++) {
        array[i](ev);
      }
    }
    return this;
  }
}
