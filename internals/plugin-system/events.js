const nanoevents = require('nanoevents');
const unbindAll = require('nanoevents/unbind-all');
const pluginEventsEmitter = new nanoevents();

const pluginEventsUnbindCollection = new Map(); // { pluginId: function[] }

module.exports = {
  clear: () => {
    unbindAll(pluginEventsEmitter);
    pluginEventsUnbindCollection.clear();
  },
  emit: (eventId, ...args) => {
    pluginEventsEmitter.emit(eventId, ...args);
  },
  off: (id) => {
    if (!module.exports.hasSubscribed(id)) return;
    pluginEventsUnbindCollection.get(id).forEach((unbinder) => {
      unbinder();
    });

    pluginEventsUnbindCollection.delete(id);
  },
  on: (eventId, id, callback) => {
    let unbinderCollection = pluginEventsUnbindCollection.get(id);
    if (!unbinderCollection) {
      unbinderCollection = [];
    }

    unbinderCollection.push(pluginEventsEmitter.on(eventId, callback));
    pluginEventsUnbindCollection.set(id, unbinderCollection);
  },
  hasSubscribed: (id) => {
    return pluginEventsUnbindCollection.has(id);
  }
}