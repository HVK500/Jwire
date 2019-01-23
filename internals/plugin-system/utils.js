const fs = require('fs');
const pathing = require('path');
const nanoevents = require('nanoevents');
const unbindAll = require('nanoevents/unbind-all');
const helpers = require('../helpers');
const pluginBase = require('./plugin-base');
const pluginEventsEmitter = new nanoevents();
const pluginEventsUnbindCollection = {}; // { pluginId: function[] }

module.exports = {
  createGuid: () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  },
  events: {
    clear: () => {
      unbindAll(pluginEventsEmitter);
      pluginEventsUnbindCollection = {};
    },
    emit: (eventId, ...args) => {
      pluginEventsEmitter.emit(eventId, ...args);
    },
    off: (guid) => {
      if (!pluginEventsUnbindCollection[guid]) return;
      pluginEventsUnbindCollection[guid].forEach(unbinder => {
        unbinder();
      });
      pluginEventsUnbindCollection[guid] = undefined;
    },
    on: (eventId, guid, callback) => {
      pluginEventsUnbindCollection[guid] = pluginEventsUnbindCollection[guid] == null ? [] : pluginEventsUnbindCollection[guid];
      pluginEventsUnbindCollection[guid].push(pluginEventsEmitter.on(eventId, callback));
    }
  },
  getPluginName: (root) => {
    return pathing.basename(root);
  },
  getConfigPath: (root) => {
    return pathing.resolve(pathing.join(root, 'config.json'));
  },
  getIndexPath: (root) => {
    return pathing.resolve(pathing.join(root, 'index.js'));
  },
  // hasConfigChanged: (plugin) => {
  //   const fileExists = fs.existsSync(module.exports.getConfigPath(plugin.parentFolder));

  //   if (!plugin.config.content && fileExists) {
  //     return 'added';
  //   } else if (plugin.config.content && !fileExists) {
  //     return 'removed';
  //   } else if (plugin.config.content && fs.statSync(plugin.config.path).mtime.getTime() !== plugin.config.timeChanged) {
  //     return 'changed';
  //   }

  //   return 'unchanged';
  // },
  // hasIndexChanged: (plugin) => {
  //   return fs.statSync(plugin.index.path).mtime.getTime() !== plugin.index.timeChanged;
  // },
  // loadUsing: (properties) => {
  //   assignGuid(properties);
  //   properties.index.module(pluginBase(properties));
  // },
  // resolveConfig: (plugin, configPath) => {
  //   plugin.config = {
  //     enabled: true
  //   };

  //   if (fs.existsSync(configPath)) {
  //     plugin.config = module.exports.setConfig(configPath);
  //   }
  // },
  removeFromRequireCache: (modulePath) => {
    require.cache[require.resolve(modulePath)] = undefined;
  },
  // setConfig: (path) => { // setIndex
  //   const content = helpers.readFile(path, true);
  //   return {
  //     enabled: (content.enabled == null ? true : content.enabled),
  //     path: path,
  //     content: content,
  //     timeChanged: fs.statSync(path).mtime.getTime()
  //   };
  // },
  // setIndex: (path) => { // setIndex
  //   require.cache[require.resolve(path)] = undefined;

  //   return {
  //     path: path,
  //     module: require(path),
  //     timeChanged: fs.statSync(path).mtime.getTime()
  //   };
  // },
  // stillExists: (plugin) => { // requiredFilesExists
  //   return fs.existsSync(plugin.parentFolder) && fs.existsSync(plugin.index.path);
  // },
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