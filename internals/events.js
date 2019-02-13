const nanoevents = require('nanoevents');
const unbindAll = require('nanoevents/unbind-all');
const eventsEmitter = new nanoevents();

const unbindEventCollection = new WeakMap(); // { pluginId: function[] }

module.exports = {
  clear: () => {
    unbindAll(eventsEmitter);
    unbindEventCollection = new WeakMap();
  },
  emit: (eventId, ...args) => {
    eventsEmitter.emit(eventId, ...args);
  },
  hasSubscribed: (id) => {
    return unbindEventCollection.has(id);
  },
  off: (id) => {
    if (!module.exports.hasSubscribed(id)) return;
    unbindEventCollection.get(id).forEach((unbinder) => {
      unbinder();
    });
    unbindEventCollection.delete(id);
  },
  on: (eventId, id, callback) => {
    const unbinderCollection = unbindEventCollection.get(id) || [];
    unbinderCollection.push(eventsEmitter.on(eventId, callback));
    unbindEventCollection.set(id, unbinderCollection);
  }
};
