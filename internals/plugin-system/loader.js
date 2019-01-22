const chokidar = require('chokidar');
const pathing = require('path');
const helpers = require('../helpers');
const pluginManager = require('./manager');
const pluginUtils = require('./utils');

// 1. load plugins found
// 2. create a watcher that only checks for new plugin folders
// - plugins will remove themselves from the plugin pool

// pluginSystem.registerLogger(helpers.getLoggerContext());

// const initialLoadPlugins = (pluginFolder) => {
//   // for (let pluginDirectory of pluginDirectories) {
//   //   // const plugin = {};
//   //   // const indexPath = pluginUtils.getIndexPath(pluginDirectory);
//   //   // const configPath = pluginUtils.getConfigPath(pluginDirectory);

//   //   // plugin.parentFolder = pluginDirectory;
//   //   // plugin.index = pluginUtils.setIndex(indexPath);

//   //   // pluginUtils.resolveConfig(plugin, configPath);

//   //   // result.push(plugin);
//   // }

//   // result.forEach((plugin) => {
//   //   pluginUtils.loadUsing(plugin);
//   // });

//   // pluginMap = result;
// };

// const reloadPlugins = () => {
//   const alteredPlugins = [];
//   const plugins = [];

//   pluginMap.forEach((plugin) => {
//     if (!pluginUtils.stillExists(plugin)) return;
//     const indexChangedState = pluginUtils.hasIndexChanged(plugin);
//     const configChangedState = pluginUtils.hasConfigChanged(plugin);

//     if (indexChangedState) {
//       plugin.index = pluginUtils.setIndex(plugin.index.path);
//     }

//     switch (configChangedState) {
//       case 'removed':
//         // plugin.config = undefined;
//         // break;
//       case 'added':
//       case 'changed':
//         pluginUtils.resolveConfig(
//           plugin,
//           pluginUtils.getConfigPath(plugin.parentFolder)
//         );
//         break;
//       case 'unchanged':
//       default:
//         break;
//     }

//     if (indexChangedState || configChangedState !== 'unchanged') {
//       pluginUtils.events.off(plugin.guid);
//       alteredPlugins.push(plugin);
//     } else {
//       plugins.push(plugin);
//     }
//   });

//   alteredPlugins.forEach((plugin) => {
//     pluginUtils.loadUsing(plugin);
//     plugins.push(plugin);
//   });

//   pluginMap = plugins;
// };

module.exports = (pluginDirectory, disablePluginHotReloading = false) => {
  // // TODO: Check for at least one plugin
  // // TODO: Error handling
  // // TODO: Logging
  return helpers.getDirectories(pluginDirectory)
    .then((pluginDirectories) => {
      pluginDirectories.forEach((directory) => {
        pluginManager.addPlugin(directory);
      });
    }).then(() => {
      if (disablePluginHotReloading) return;
      chokidar.watch(pluginDirectory, {
        ignoreInitial: true,
        followSymlinks: false,
        ignorePermissionErrors: true,
        depth: 1
      }).on('ready', () => {
        // TODO: Logging
        console.log('Plugin-system watching for changes');
      }).on('error', (error) => {
        // TODO: Logging
        console.log('error', error);
      }).on('addDir', (directory) => {
        pluginManager.addPlugin(pathing.resolve(directory));
      }).on('unlinkDir', (directory) => {
        pluginManager.removePlugin(pathing.resolve(directory));
      });
    });
};