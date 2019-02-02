const pathing = require('path');
const { attachWatcher, readFile, log } = require('../helpers');
const { getIndexPath, getConfigPath } = require('./utils');

const resolveIndex = (plugin) => {
  // Clean out the previously resolved from the module cache
  require.cache[require.resolve(plugin.index.path)] = undefined;
  // Set the newly resolved module
  plugin.index.module = require(plugin.index.path);
};

const setConfig = (plugin) => {
  readFile(plugin.config.path, true)
    .then((content) => {
      config.enabled = (content.enabled == null ? true : content.enabled);
      config.path = filePath;
      config.content = content;
    }, (errorMessage) => {
      log.error(`Encountered an issue while reading Config file within the "${plugin.name}" plugin: ${errorMessage}`);
      // TODO: Use empty config
    });
};

const setupFileWatchers = (plugin) => {
    // Create a watcher that looks for changes to the files index
    attachWatcher(plugin.index.path, {
      ready: () => {
        log.info(`Watching for Index file changes in the "${plugin.name}" plugin.`);
      },
      error: (error) => {
        log.error(`Encountered an issue while watching the Index file in the "${plugin.name}" plugin, proceeding to dispose of plugin: ${error}`);
        plugin.dispose();
      },
      unlink: () => {
        log.info(`Detected the deletion of the Index file in the "${plugin.name}" plugin, proceeding to dispose of plugin.`);
        plugin.dispose();
      },
      change: () => {
        log.info(`Detected a change to the Index file in the "${plugin.name}" plugin, proceeding to reload module.`);
        // TODO: Reload the file
      }
    });

    // Create a watcher that looks for changes to the files config
    attachWatcher(plugin.config.path, {
      ready: () => {
        log.info(`Watching for Config file changes in the "${plugin.name}" plugin.`);
      },
      error: (error) => {
        log.error(`Encountered an issue while watching the Config file in the "${plugin.name}" plugin: ${error}`);
      },
      add: () => {
        // pathing.resolve(directory)
        // TODO: Config populate empty config object.
        log.info(`Detected the addition of the Config file in the "${plugin.name}" plugin, proceeding to load config.`);
      },
      unlink: () => {
        // pathing.resolve(directory)
        log.info(`Detected the deletion of the Config file in the "${plugin.name}" plugin, proceeding to use default config.`);
        // TODO: Config removed empty config object.
      },
      change: () => {
        // pathing.resolve(directory)
        log.info(`Detected a change to the Config file in the "${plugin.name}" plugin, proceeding to reload config.`);
        // TODO: Reload the file
      }
    });
};

const getPluginName = (root) => {
  return pathing.basename(root);
};

module.exports = function (baseDirectory) {
  this.parentFolder = baseDirectory;
  this.id = +new Date;
  this.name = getPluginName(baseDirectory);

  this.index = {
    path: getIndexPath(baseDirectory),
    module: null,
  };

  this.config = {
    enabled: true,
    path: '', // Get the config path
    content: ''
  };

  this.dispose = () => {
    // TODO: unhook plugins events
  };

  resolveIndex(this);

  setupFileWatchers(this);
};