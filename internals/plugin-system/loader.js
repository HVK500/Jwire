const helpers = require('../helpers');
const pluginUtils = require('./utils');

// pluginSystem.registerLogger(helpers.getLoggerContext());

let pluginMap = [];

const initialLoadPlugins = (pluginFolder) => {
  const result = [];
  const pluginFolders = helpers.getDirectories(pluginFolder);

  for (let pluginFolder of pluginFolders) {
    const plugin = {};
    const indexPath = pluginUtils.getIndexPath(pluginFolder);
    const configPath = pluginUtils.getConfigPath(pluginFolder);

    plugin.parentFolder = pluginFolder;
    plugin.index = pluginUtils.setIndex(indexPath);

    pluginUtils.resolveConfig(plugin, configPath);

    result.push(plugin);
  }

  result.forEach((plugin) => {
    pluginUtils.loadUsing(plugin);
  });

  pluginMap = result;
};

const reloadPlugins = () => {
  const alteredPlugins = [];
  const plugins = [];

  pluginMap.forEach((plugin) => {
    if (!pluginUtils.stillExists(plugin)) return;
    const indexChangedState = pluginUtils.hasIndexChanged(plugin);
    const configChangedState = pluginUtils.hasConfigChanged(plugin);

    if (indexChangedState) {
      plugin.index = pluginUtils.setIndex(plugin.index.path);
    }

    switch (configChangedState) {
      case 'removed':
        // plugin.config = undefined;
        // break;
      case 'added':
      case 'changed':
        pluginUtils.resolveConfig(
          plugin,
          pluginUtils.getConfigPath(plugin.parentFolder)
        );
        break;
      case 'unchanged':
      default:
        break;
    }

    if (indexChangedState || configChangedState !== 'unchanged') {
      pluginUtils.events.off(plugin.guid);
      alteredPlugins.push(plugin);
    } else {
      plugins.push(plugin);
    }
  });

  alteredPlugins.forEach((plugin) => {
    pluginUtils.loadUsing(plugin);
    plugins.push(plugin);
  });

  pluginMap = plugins;
};

module.exports = (pluginFolder) => {
  // TODO: Check for at least one plugin
  // TODO: Error handling
  // TODO: Logging

  if (pluginMap.length === 0) {
    initialLoadPlugins(pluginFolder);
    return;
  }

  // Check what plugins have changed - collect the ones that need to be reloaded
  reloadPlugins();
};
