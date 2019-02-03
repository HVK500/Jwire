const PluginModel = require('./plugin-model');
const { fileExists, log } = require('../helpers');
const { getIndexPath } = require('./utils');

const container = new Map();
let hotReloading = true;

const pluginFailed = (plugin, resolve) => {
  return (reason) => {
    log.warn(`Failed to create the "${plugin.name}" plugin. ${reason}`);
    resolve();
  }
};

module.exports = {
  addPlugin: (directory) => {
    // TODO: Ignore folders that start with underscore (disabled)
    return new Promise((resolve, reject) => {
      const plugin = new PluginModel(directory);
      fileExists(getIndexPath(directory))
        .then(() => {
          plugin.initialize(hotReloading)
            .then(() => {
              container.set(plugin.id, plugin);
              resolve();
            }).catch(pluginFailed(plugin, resolve));
        }).catch(pluginFailed(plugin, resolve));
    });
  },
  hotReload: (disable) => {
    hotReloading = !disable;
    log.warn(`Plugin hot reloading has been ${hotReloading ? 'enabled' : 'disabled'}.`);
  },
  ensureMinimumPluginsLoaded: () => {
    if (container.size === 0) {
      throw `There are no plugins loaded, you need at least one plugin to execute a query.`;
    }
  },
  removePlugin: (id) => {
    const plugin = container.get(id);

    if (plugin == null) {
      log.warn('Plugin does not exist in pool, skipping removal.');
      return;
    }

    plugin.dispose();
    container.delete(plugin.id);
    module.exports.ensureMinimumPluginsLoaded();
  }
};