const PluginModel = require('./plugin-model');
const { fileExists, log } = require('../helpers');
const { getIndexPath } = require('./plugin-utils');

const container = new Map();
let hotReloading = true;

module.exports = {
  addPlugin: (directory) => {
    return new Promise(async (resolve, reject) => {
      const plugin = new PluginModel(directory);

      try {
        // If index is missing, an error will throw
        await fileExists(getIndexPath(directory), true);
        // Initialize the plugin, on success store in the plugin container
        await plugin.initialize(hotReloading);
        container.set(plugin.id, plugin);
        resolve();
      } catch(reason) {
        // Fail singular plugin load
        log.warn(`Failed to create the "${plugin.name}" plugin. ${reason}`);
        resolve();
      }
    });
  },
  throwIfMinimumPluginsNotMet: () => {
    if (container.size === 0) {
      throw 'There are no plugins loaded, you need at least one plugin to execute a query.';
    }
  },
  hotReload: (disable) => {
    hotReloading = !disable;
    log.warn(`Plugin hot reloading has been ${hotReloading ? 'enabled' : 'disabled'}.`);
  },
  removePlugin: (id) => {
    const plugin = container.get(id);

    if (plugin == null) {
      log.warn('Plugin does not exist in pool, skipping removal.');
      return;
    }

    plugin.dispose();
    container.delete(plugin.id);
    module.exports.throwIfMinimumPluginsNotMet();
  }
};