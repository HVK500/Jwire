const PluginModel = require('./plugin-model');
const container = new Map();

module.exports = {
  addPlugin: (directory) => {
    const plugin = new PluginModel(directory);
    container.set(plugin.guid, plugin);
  },
  // getPlugins: () => {
  //   return container.values();
  // },
  removePlugin: (parentFolder) => {
    const plugin = container.get(parentFolder);
    plugin.dispose();
    container.delete(plugin.guid);
  }
};
