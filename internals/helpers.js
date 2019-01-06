const fs = require('fs');
const glob = require('glob');
const pathing = require('path');
const mkdirp = require('mkdirp');
const logWrapper = require('log-wrapper');
const config = require('../config.json');

const logClient = null;
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
  getFileExtension: path => {
    return pathing.extname(path);
  },
  getFileName: path => {
    return pathing.basename(path, pathing.extname(path));
  },
  getFilePaths: (sourceFolder, search) => {
    return glob.sync(search, {
      cwd: sourceFolder,
      nosort: true,
      absolute: true
    });
  },
  getLogger: context => {
    if (context) {
      logClient = logWrapper(context);
    }

    return logClient;
  },
  getLoggerContext: () => {
    if (!config.logging) return {};

    const base = (...args) => console.log(JSON.stringify(args));

    return {
      trace: base,
      info: base,
      warn: base,
      error: base,
      debug: base,
      fatal: base
    };
  },
  loopObject: (parent, callback) => {
    for (let [key, value] of Object.entries(parent)) {
      callback(key, value, parent);
    }
  },
  createObjectBuilder: () => {
    return () => {
      let sortContainer = [];
      let orderPreferenceCounter = 1;
      return {
        add: (key, value, orderPreference) => {
          orderPreference = !orderPreference ? orderPreferenceCounter : orderPreference;
          sortContainer.push({
            key: key,
            value: value,
            orderPreference: orderPreference
          });
          orderPreferenceCounter++;
        },
        output: () => {
          let result = {};
          sortContainer.sort((a, b) => {
            return a.orderPreference - b.orderPreference;
          }).forEach(item => {
            result[item.key] = item.value;
          });
          sortContainer = [];
          orderPreferenceCounter = 1;
          return result;
        }
      };
    }
  },
  readFile: (path, parse) => {
    path = pathing.resolve(path);
    const result = fs.readFileSync(path, {
      encoding: 'utf8'
    });
    return !parse ? result : JSON.parse(result);
  },
  tryParseValue: value => {
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
