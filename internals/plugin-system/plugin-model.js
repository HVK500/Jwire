const events = require('../events');
const pathing = require('path');
const { attachFileSystemWatcher, removeFileSystemWatcher, readFile, log, fileExists } = require('../helpers');
const { getIndexPath, getConfigPath, utils, generateGuid } = require('./plugin-utils');

const indexFailed = (plugin, reason = '') => {
  return `The "${plugin.name}" plugin failed to read index because it has was not integrated correctly. ${reason}`;
};

const setConfig = (plugin) => {
  return new Promise(async (resolve, reject) => {
    const path = getConfigPath(plugin.parentFolder);
    // Set default plugin config
    plugin.config = {
      enabled: true,
      path: '',
      content: undefined
    };

    if (!await fileExists(path)) {
      return resolve(`No config file found within the "${plugin.name}" plugin, proceeding to use default config.`);
    }

    try {
      const content = await readFile(path, true);
      plugin.config.enabled = (content.enabled == null ? true : content.enabled);

      if (!plugin.config.enabled) {
        reject(`Plugin is disabled.`);
      }

      plugin.config.path = path;
      plugin.config.content = content;
      resolve();
    } catch(reason) {
      resolve(`Encountered an issue while reading the config file within the "${plugin.name}" plugin, proceeding to use default config. ${reason}`);
    }
  });
};

const setIndex = (plugin) => {
  return new Promise(async (resolve, reject) => {
    const path = getIndexPath(plugin.parentFolder);
    plugin.index = plugin.index ? plugin.index : {};
    plugin.index.path = path;
    plugin.index.module = null;

    try {
      await fileExists(path, true);

      // Remove the module from the module cache
      require.cache[require.resolve(path)] = undefined;

      const index = require(path);

      // Check whether the module is in the expected format
      if (typeof index !== 'function') {
        return reject(indexFailed(plugin));
      }

      unsubscribeEvents(plugin);

      try {
        // Hand over the details the system contains to the plugin implementation
        index(subscribeEvents(plugin), plugin.config.content, utils);
      } catch (error) {
        return reject(indexFailed(plugin, error));
      }

      plugin.index.module = index;
      resolve();
    } catch(reason) {
      return reject(reason);
    }
  })
};

const setName = (plugin) => {
  plugin.name = pathing.basename(plugin.parentFolder);
};

const subscribeEvents = (plugin) => {
  return (eventRegister) => {
    if (typeof eventRegister !== 'object' || Array.isArray(eventRegister)) {
      throw `The "${plugin.name}" plugin contained a malformed event subscription structure`;
    }

    new Map(Object.entries(eventRegister)).forEach((event, eventName) => {
      events.on(eventName, plugin.id, event);
    });

    log.info(`Subscribed to events for the "${plugin.name}" plugin.`);
  }
};

const unsubscribeEvents = (plugin) => {
  if (!events.hasSubscribed(plugin.id)) return;

  events.off(plugin.id);
  log.info(`Unsubscribed from all events for the "${plugin.name}" plugin.`);
};

const setupFileWatchers = (plugin) => {
  const handlePluginDisposal = (message) => {
    log.error(message);
    require('./plugin-manager')
        .removePlugin(plugin.id);
  };

  const handleDisabledPlugin = (reason) => {
    handlePluginDisposal(`Proceeding to dispose of the "${plugin.name}" plugin, as the ${reason}`);
  };

  // Create a watcher that looks for changes to the files index
  plugin.index.watcher = attachFileSystemWatcher(plugin.index.path, {
    ready: () => {
      log.info(`Watching for Index file changes in the "${plugin.name}" plugin.`);
    },
    error: (error) => {
      handlePluginDisposal(`Encountered an issue while watching the Index file in the "${plugin.name}" plugin, proceeding to dispose of plugin: ${error}`);
    },
    unlink: () => {
      log.info(`Detected the deletion of the Index file in the "${plugin.name}" plugin, proceeding to dispose of plugin.`);
      plugin.dispose();
    },
    change: () => {
      log.info(`Detected a change to the Index file in the "${plugin.name}" plugin, proceeding to reload module.`);
      setIndex(plugin)
        .catch(error);
    }
  });

  // Create a watcher that looks for changes to the files config
  plugin.config.watcher = attachFileSystemWatcher(plugin.config.path, {
    ready: () => {
      log.info(`Watching for Config file changes in the "${plugin.name}" plugin.`);
    },
    error: (error) => {
      handlePluginDisposal(`Encountered an issue while watching the Config file in the "${plugin.name}" plugin, proceeding to dispose of plugin: ${error}`);
    },
    add: () => {
      log.info(`Detected the addition of the Config file in the "${plugin.name}" plugin, proceeding to load config.`);
      setConfig(plugin)
        .catch(handleDisabledPlugin);
    },
    unlink: () => {
      log.info(`Detected the deletion of the Config file in the "${plugin.name}" plugin, proceeding to use default config.`);
      setConfig(plugin);
    },
    change: () => {
      log.info(`Detected a change to the Config file in the "${plugin.name}" plugin, proceeding to reload config.`);
      setConfig(plugin)
        .catch(handleDisabledPlugin);
    }
  });
};

const removeFileWatchers = (plugin) => {
  removeFileSystemWatcher(
    plugin.index.watcher,
    plugin.config.watcher
  );
  log.info(`Stopped watching the files for the "${plugin.name}" plugin.`);
};

module.exports = function (pluginDirectory) {
  this.parentFolder = pluginDirectory;
  this.id = generateGuid();
  setName(this);

  this.initialize = (hotReloadEnabled) => {
    return new Promise(async (resolve, reject) => {
      try {
        await setConfig(this);
        await setIndex(this);

        if (hotReloadEnabled) {
          setupFileWatchers(this);
        }

        log.info(`Successfully initialized the "${this.name}" plugin.`);
        resolve();
      } catch(reason) {
        reject(reason);
      }
    });
  };

  this.dispose = () => {
    log.info(`Disposing of the "${this.name}" plugin.`);
    unsubscribeEvents(this);
    removeFileWatchers(this);
  };
};