const config = require('../config.json');
const fs = require('fs');
const mkdirp = require('mkdirp');
const watcher = require('chokidar');
const pathing = require('path');
const tinyGlob = require('tiny-glob');
const { create, commonFormats, commonTransports } = require('./logger');

module.exports = {
  attachFileSystemWatcher: (path, listeners) => {
    const result = watcher.watch(path, {
      ignoreInitial: true,
      awaitWriteFinish: true,
      followSymlinks: false,
      ignorePermissionErrors: true,
      depth: 1
    });

    module.exports.loopObject(listeners, (eventName, callback) => {
      result.on(eventName, callback);
    });

    return result;
  },
  createPath: (path) => {
    return new Promise((resolve, reject) => {
      const directory = pathing.dirname(path);

      // If the directory does not exist, create it
      mkdirp(directory, (error) => {
        // Path flows straight through so it can be used to chain
        resolve(path);
      });
    });
  },
  formatTimeStamp: () => {
    const timeStamp = new Date();
    return `${timeStamp.getFullYear()}-${timeStamp.getMonth() + 1}-${timeStamp.getDate()}-${timeStamp.getHours()}-${timeStamp.getMinutes()}`;
  },
  fileExists: (filePath, throwOnError = false) => {
    return new Promise((resolve, reject) => {
      fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK, (error) => {
        if (error) {
          if (!throwOnError) return resolve(false);
          return reject(error);
        }

        resolve(true);
      });
    });
  },
  getSystemConfig: () => {
    return config;
  },
  getDirectories: (path) => {
    return new Promise(async (resolve, reject) => {
      path = pathing.resolve(path);
      if (!await module.exports.fileExists(path)) {
        return reject(`Directory does not exist or is inaccessible - "${path}"`);
      }

      fs.readdir(path, {
        encoding: 'utf8',
        withFileTypes: true
      }, (error, items) => {
        if (error) {
          return reject(`There was a problem reading directory - "${path}". ${error}`);
        } else if (items.length === 0) {
          return reject(`No plugins in directory - "${path}", there should be at least one plugin to execute a query.`);
        }

        resolve(
          items.filter((item) =>
            item.isDirectory() && !(/\.git$/.test(item.name))).map((item) =>
            pathing.join(path, item.name))
        );
      });
    });
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
      }
    );
  },
  log: create({
    transports: [
      commonTransports.console(commonFormats.systemConsole()),
      commonTransports.systemFile
    ]
  }),
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
    return new Promise((resolve, reject) => {
      path = pathing.resolve(path);
      fs.readFile(path, {
          encoding: 'utf8',
          flag: 'r'
        },
        (err, content) => {
          if (err || !content) return reject(`There was a problem reading - ${path}. ${err}`);
          content = content.replace(/^\uFEFF/, ''); // Remove BOM from resulting string
          resolve(!parse ? content : JSON.parse(content));
        }
      );
    });
  },
  removeFileSystemWatcher: (...watchers) => {
    watchers.forEach((watcher) => {
      watcher.close();
    });
  },
  tryParseValue: (value) => {
    try {
      return JSON.parse(value); // object | array
    } catch (error) {
      return value; // string
    }
  },
  writeFile: (path, content, parse) => {
    return new Promise(async (resolve, reject) => {
      path = await module.exports.createPath(pathing.resolve(path));
      content = !parse ? content : JSON.stringify(content, null, 2);

      fs.writeFile(path, content,
        (error) => {
          if (error) return reject(`There was a problem writing file - ${path}. ${error}`);
          resolve();
        }
      );
    });
  }
};