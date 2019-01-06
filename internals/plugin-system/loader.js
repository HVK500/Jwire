const fs = require('fs');
const pathing = require('path');
const pluginBase = require('./base');
const pluginUtils = require('./utils');

// pluginSystem.registerLogger(helpers.getLoggerContext());

let pluginMap = [];

const initialLoadPlugins = (pluginFolder) => {
  const result = [];
  const resolvedPluginRoot = pathing.resolve(pluginFolder);
  const folders = fs.readdirSync(resolvedPluginRoot);

  for (let folder of folders) {
    const plugin = {};
    const indexPath = `${resolvedPluginRoot}/${folder}/index.js`;
    const configPath = `${resolvedPluginRoot}/${folder}/config.json`;
    plugin.enabled = true;
    plugin.parentFolder = `${resolvedPluginRoot}/${folder}`;
    plugin.index = pluginUtils.setIndex(indexPath);

    if (fs.existsSync(configPath)) {
      plugin.config = pluginUtils.setConfig(configPath);
      plugin.enabled = pluginUtils.setEnabledState(plugin.config);
    }

    result.push(plugin);
  }

  result.forEach((plugin) => {
    plugin.index.module(
      pluginBase,
      (plugin.config == null ? undefined : plugin.config.content),
      pluginUtils.utils
    );
  });

  pluginMap = result;
};

const reloadPlugins = () => {
  const alteredPlugins = [];
  const plugins = [];

  pluginMap.forEach((plugin) => {
    if (pluginUtils.stillExists(plugin)) {
      const indexChangedState = pluginUtils.hasIndexChanged(plugin);
      if (indexChangedState) {
        plugin.index = pluginUtils.setIndex(plugin.index.path);
      }

      const configChangedState = pluginUtils.hasConfigChanged(plugin);
      switch (configChangedState) {
        case 'removed':
          plugin.config = undefined;
          break;
        case 'added':
        case 'changed':
          plugin.config = pluginUtils.setConfig(`${plugin.parentFolder}/config.json`);
          plugin.enabled = pluginUtils.setEnabledState(plugin.config);
          break;
        case 'unchanged':
        default:
          break;
      }

      if (indexChangedState || configChangedState !== 'unchanged') {
        alteredPlugins.push(plugin);
      } else {
        plugins.push(plugin);
      }
    }
  });

  alteredPlugins.forEach((plugin) => {
    plugin.index.module(
      pluginBase,
      (plugin.config == null ? undefined : plugin.config.content),
      pluginUtils.utils
    );

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
