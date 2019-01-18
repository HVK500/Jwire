const fs = require('fs');
const tinyGlob = require('tiny-glob');
const pathing = require('path');
const mkdirp = require('mkdirp');
const logWrapper = require('log-wrapper');
const config = require('../config.json');

let logClient = null;
const createPath = (path) => {
  const directory = pathing.dirname(path);
  // If the directory does not exist, create it
  mkdirp.sync(directory);

  // Path flows straight through so it can be used to chain
  return path;
};

module.exports = {
  dateDiff: (d1, d2) => {
    // d1 is larger date, d2 is smaller date
    return Math.ceil(Math.abs(d1.getTime() - d2.getTime()));
  },
  formatTimeStamp: () => {
    const timeStamp = new Date();
    return `${timeStamp.getFullYear()}-${timeStamp.getMonth() + 1}-${timeStamp.getDate()}-${timeStamp.getHours()}-${timeStamp.getMinutes()}`;
  },
  getConfig: () => {
    return config;
  },
  getDirectories: (path) => {
    return fs.readdirSync(pathing.resolve(path))
      .map(name => pathing.join(path, name))
      .filter(module.exports.isDirectory);
  },
  getFileExtension: (path) => {
    return pathing.extname(path);
  },
  getFileName: (path) => {
    return pathing.basename(path, pathing.extname(path));
  },
  getFilePaths: async (sourceFolder, search) => {
    return await tinyGlob(
      search, {
      cwd: sourceFolder,
      filesOnly: true,
      absolute: true
    });
  },
  getLogger: (context) => { // TODO: Redo this implemenation
    if (context) {
      logClient = logWrapper(context);
    }

    return logClient;
  },
  getLoggerContext: () => { // TODO: Redo this implemenation
    if (!config.logging) return {};

    const base = (level) => {
      return (message, ...args) => console.log(`[${level}]`, message, (args.length !== 0 ? JSON.stringify(args) : ''))
    };

    // TODO: Use chalk to colour messages

    return {
      trace: base('TRACE'),
      info: base('INFO'),
      warn: base('WARN'),
      error: base('ERROR'),
      debug: base('DEBUG'),
      fatal: base('FATAL')
    };
  },
  isDirectory: (path) => {
    if (/\.git$/.test(path)) return false;
    return fs.lstatSync(path).isDirectory();
  },
  loopObject: (parent, callback) => {
    for (let [key, value] of Object.entries(parent)) {
      callback(key, value, parent);
    }
  },
  objectBuilder: function () {
    this.sortContainer = [];
    this.orderPreferenceCounter = 1;

    this.add = (key, value, orderPreference) => {
      orderPreference = !orderPreference ? this.orderPreferenceCounter : orderPreference;
      this.sortContainer.push({
        key: key,
        value: value,
        orderPreference: orderPreference
      });
      this.orderPreferenceCounter++;
      return this;
    };

    this.isEmpty = () => {
      return this.sortContainer.length === 0;
    };

    this.output = () => {
      let result = {};
      this.sortContainer.sort((a, b) => {
        return a.orderPreference - b.orderPreference;
      }).forEach(item => {
        result[item.key] = item.value;
      });
      this.sortContainer = [];
      this.orderPreferenceCounter = 1;
      return result;
    };
  },
  readFile: (path, parse) => {
    try {
      path = pathing.resolve(path);
      const result = fs.readFileSync(path, {
        encoding: 'utf8',
        flag: 'r'
      }).replace(/^\uFEFF/, ''); // Remove BOM from resulting string
      return !parse ? result : JSON.parse(result);
    } catch (err) {
      throw `There was a problem reading - ${path}. ${err}`;
    }
  },
  tryParseValue: (value) => {
    try {
      return JSON.parse(value); // object | array
    } catch (err) {
      return value; // string
    }
  },
  writeFile: (path, data, parse) => {
    data = !parse ? data : JSON.stringify(data, null, 2);
    fs.writeFileSync(createPath(path), data);
  }
};
