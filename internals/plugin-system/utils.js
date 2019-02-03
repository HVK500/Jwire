const pathing = require('path');
const { create, commonFormats, commonTransports } = require('../logger');
const { loopObject, objectBuilder, readFile, writeFile } = require('../helpers');

module.exports = {
  generateGuid: () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  },
  getConfigPath: (root) => {
    return pathing.resolve(pathing.join(root, 'config.json'));
  },
  getIndexPath: (root) => {
    return pathing.resolve(pathing.join(root, 'index.js'));
  },
  utils: {
    log: create({
      transports: [
        commonTransports.console(commonFormats.pluginConsole()),
        commonTransports.pluginFile(commonFormats.pluginFile())
      ]
    }),
    loopObject: loopObject,
    objectBuilder: objectBuilder,
    pathing: pathing,
    readFile: readFile,
    writeFile: writeFile
  }
};