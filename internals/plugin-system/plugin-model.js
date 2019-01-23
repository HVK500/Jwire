const fs = require('fs');
const pathing = require('path');
const chokidar = require('chokidar');
const manager = require('./manager');
const utils = require('./utils');
const { log } = require('../helpers');

// const watcher = (filePath) => {
//   // TODO: Create a watcher that looks for changes to the files (index and config)
//   chokidar.watch(filePath, {
//     ignoreInitial: true,
//     followSymlinks: false,
//     ignorePermissionErrors: true,
//     depth: 1
//   }).on('ready', () => {
//     // TODO: Logging
//     console.log(`Plugin watching for changes.`);
//   }).on('error', error => {
//     // TODO: Logging
//     console.log('error', error);
//   }).on('add', directory => {
//     // TODO: Config populate empty config object.
//     // pathing.resolve(directory)
//   }).on('unlink', directory => {
//     // TODO: Index removed dispose of plugin.
//     // TODO: Config removed empty config object.
//     // pathing.resolve(directory)
//   }).on('change', directory => {
//     // TODO: Reload the file
//     // pathing.resolve(directory)
//   });
// };

module.exports = function (baseDirectory) {
  this.parentFolder = baseDirectory;
  this.guid = utils.createGuid();
  this.name = utils.getPluginName(baseDirectory);

  this.index = {
    path: utils.getIndexPath(baseDirectory),
    module: null,
  };

  this.config = {
    enabled: true,
    path: '',
    content: ''
  };

  this.resolveIndex = () => {
    utils.removeFromRequireCache(this.index.path);
    this.index.module = require(this.index.path);
  };

  this.setConfig = (filePath) => {
    utils.utils.readFile(filePath, true)
      .then(content => {
        config.enabled = (content.enabled == null ? true : content.enabled);
        config.path = filePath;
        config.content = content;
      }, (errorMessage) => {
        log.error(`Encountered an issue while reading Config file within the "${this.name}" plugin: ${errorMessage}`);
        // TODO: Use empty config
      });
  };

  this.dispose = () => {
    // TODO: unhook plugins events
  };

  this.resolveIndex();

  // TODO: Create a watcher that looks for changes to the files (index and config)
  chokidar.watch(this.index.path, {
    ignoreInitial: true,
    awaitWriteFinish: true,
    followSymlinks: false,
    ignorePermissionErrors: true,
    depth: 1
  }).on('ready', () => {
    log.info(`Watching for Index file changes in the "${this.name}" plugin.`);
  }).on('error', error => {
    log.error(`Encountered an issue while watching the Index file in the "${this.name}" plugin, proceeding to dispose of plugin: ${error}`);
    this.dispose();
  }).on('unlink', () => {
    log.info(`Detected the deletion of the Index file in the "${this.name}" plugin, proceeding to dispose of plugin.`);
    this.dispose();
  }).on('change', () => {
    log.info(`Detected a change to the Index file in the "${this.name}" plugin, proceeding to reload module.`);
    // TODO: Reload the file
  });

  chokidar.watch(this.config.path, {
    ignoreInitial: true,
    awaitWriteFinish: true,
    followSymlinks: false,
    ignorePermissionErrors: true,
    depth: 1
  }).on('ready', () => {
    log.info(`Watching for Config file changes in the "${this.name}" plugin.`);
  }).on('error', error => {
    log.error(`Encountered an issue while watching the Config file in the "${this.name}" plugin: ${error}`);
  }).on('add', () => {
    // pathing.resolve(directory)
    // TODO: Config populate empty config object.
    log.info(`Detected the addition of the Config file in the "${this.name}" plugin, proceeding to load config.`);
  }).on('unlink', () => {
    // pathing.resolve(directory)
    log.info(`Detected the deletion of the Config file in the "${this.name}" plugin, proceeding to use default config.`);
    // TODO: Config removed empty config object.
  }).on('change', () => {
    // pathing.resolve(directory)
    log.info(`Detected a change to the Config file in the "${this.name}" plugin, proceeding to reload config.`);
    // TODO: Reload the file
  });
};