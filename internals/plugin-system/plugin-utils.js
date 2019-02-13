const pathing = require('path');
const { create, commonFormats, commonTransports } = require('../logger');
const { loopObject, objectBuilder, readFile, writeFile } = require('../helpers');

module.exports = {
  generateGuid: () => {
    const d4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${d4()}${d4()}-${d4()}-${d4()}-${d4()}-${d4()}${d4()}${d4()}`;
  },
  getConfigPath: (path) => {
    return pathing.resolve(pathing.join(path, 'config.json'));
  },
  getIndexPath: (path) => {
    return pathing.resolve(pathing.join(path, 'index.js'));
  },
  utils: {
    log: create({
      transports: [commonTransports.console(commonFormats.pluginConsole()), commonTransports.pluginFile(commonFormats.pluginFile())]
    }),
    loopObject: loopObject,
    objectBuilder: objectBuilder,
    pathing: pathing,
    readFile: readFile,
    writeFile: writeFile
  }
};