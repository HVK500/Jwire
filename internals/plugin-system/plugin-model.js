const fs = require('fs');
const manager = require('./manager');
const utils = require('./utils');

module.exports = function (baseDirectory) {
  this.guid = utils.createGuid();
  this.id = null;
  this.parentFolder = baseDirectory;

  // TODO: Create a watcher that looks for changes to the files (index and config)

  const index = {
    path: '',
    module: null,
    timeChanged: null
  };

  const config = {
    enabled: true //,
    // path: '',
    // content: '',
    // timeChanged: null
  };

  const requiredFilesExists = async () => {
    return await fs.exists(this.parentFolder) && await fs.exists(index.path);
  }

  this.setIndex = (path) => {
    utils.removeFromRequireCache(path);

    index.path = path;
    index.module = require(path);
    index.timeChanged = fs.statSync(path).mtime.getTime();
  };

  this.setConfig = (path) => {
    utils.utils.readFile(path, true)
      .then(content => {
        config.enabled = (content.enabled == null ? true : content.enabled);
        config.path = path;
        config.content = content;
        config.timeChanged = fs.statSync(path).mtime.getTime();
      }, (errorMessage) => {
        // TODO: Log error here
      });
  };

  this.dispose = () => {
    // TODO: unhook plugins events
  };
};
