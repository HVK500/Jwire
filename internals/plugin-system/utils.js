const fs = require('fs');
const helpers = require('../helpers');
const nanoevents = require('nanoevents');
const pathing = require('path');
const pluginEventsEmitter = new nanoevents();
const pluginEventsUnbindCollection = new Map(); // { pluginId: function[] }
const unbindAll = require('nanoevents/unbind-all');

module.exports = {
  events: { // TODO: Separate out this in to an events layer
    clear: () => {
      unbindAll(pluginEventsEmitter);
      pluginEventsUnbindCollection.clear();
    },
    emit: (eventId, ...args) => {
      pluginEventsEmitter.emit(eventId, ...args);
    },
    off: (id) => {
      if (!pluginEventsUnbindCollection.has(id)) return;
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

      pluginEventsUnbindCollection.set(id,
        unbinderCollection.push(pluginEventsEmitter.on(eventId, callback))
      );
    }
  },
  getConfigPath: (root) => {
    return pathing.resolve(pathing.join(root, 'config.json'));
  },
  getIndexPath: (root) => {
    return pathing.resolve(pathing.join(root, 'index.js'));
  },
  utils: {
    fileSystem: fs,
    // getLogger: helpers.getLogger,
    loopObject: helpers.loopObject,
    objectBuilder: helpers.objectBuilder,
    pathing: pathing,
    readFile: helpers.readFile,
    writeFile: helpers.writeFile
  }
};