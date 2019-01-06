const fs = require('fs');
const nanoevents = require('nanoevents');
const unbindAll = require('nanoevents/unbind-all');
const helpers = require('../helpers');
const pluginEventsEmitter = new nanoevents();
const pluginEventsUnbindCollection = {}; // { pluginId: function[] }

module.exports = {
  events: {
    clear: () => {
      unbindAll(pluginEventsEmitter);
      pluginEventsUnbindCollection = {};
    },
    emit: (id, ...args) => {
      pluginEventsEmitter.emit(id, ...args);
    },
    off: pluginId => {
      if (!pluginEventsUnbindCollection[pluginId]) return;
      pluginEventsUnbindCollection[pluginId].forEach(unbinder => {
        unbinder();
      });
      pluginEventsUnbindCollection[pluginId] = undefined;
    },
    on: (id, pluginId, callback) => {
      pluginEventsUnbindCollection[pluginId] = pluginEventsUnbindCollection[pluginId] == null ? [] : pluginEventsUnbindCollection[pluginId];
      pluginEventsUnbindCollection[pluginId].push(pluginEventsEmitter.on(id, callback));
    }
  },
  hasConfigChanged: (plugin) => {
    const fileExists = fs.existsSync(`${plugin.parentFolder}/config.json`);

    if (!plugin.config && fileExists) {
      return 'added';
    } else if (plugin.config && !fileExists) {
      return 'removed';
    } else if (plugin.config && fs.statSync(plugin.config.path).mtime.getTime() !== plugin.config.timeChanged) {
      return 'changed';
    }

    return 'unchanged';
  },
  hasIndexChanged: (plugin) => {
    return fs.statSync(plugin.index.path).mtime.getTime() !== plugin.index.timeChanged;
  },
  setConfig: path => {
    return {
      path: path,
      content: helpers.readFile(path, true),
      timeChanged: fs.statSync(path).mtime.getTime()
    };
  },
  setEnabledState: (config) => {
    return config.content.enabled == null ? true : config.content.enabled;
  },
  setIndex: path => {
    return {
      path: path,
      module: require(path),
      timeChanged: fs.statSync(path).mtime.getTime()
    };
  },
  stillExists: (plugin) => {
    return fs.existsSync(plugin.parentFolder) && fs.existsSync(plugin.index.path);
  },
  utils: {
    createObjectBuilder: helpers.createObjectBuilder,
    getFileExtension: helpers.getFileExtension,
    getFileName: helpers.getFileName,
    getLogger: helpers.getLogger,
    loopObject: helpers.loopObject,
    readFile: helpers.readFile,
    tryParseValue: helpers.tryParseValue,
    writeFile: helpers.writeFile
  }
};
