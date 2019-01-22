const PluginModel = require('./plugin-model');
const helpers = require('../helpers');
const pluginUtils = require('./utils');
const logger = helpers.getLogger();
const container = new Map();

module.exports = {
  addPlugin: (directory) => {
    // TODO: Ignore folders that start with underscore (disabled)

    helpers.fileExists(pluginUtils.getIndexPath(directory))
      .then(() => {
        const plugin = new PluginModel(directory);
        container.set(plugin.guid, plugin);
      }).catch((error) => {
        logger.error(`Failed to create plugin due to ${error}`);
      });
  },
  // getPlugins: () => {
  //   return container.values();
  // },
  removePlugin: (parentFolder) => {
    const plugin = container.get(parentFolder);

    if (plugin == null) {
      // TODO: add error message
      logger.error();
      return;
    }

    plugin.dispose();
    container.delete(plugin.guid);
  }
};