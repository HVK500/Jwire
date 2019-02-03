const config = require('../config.json');
const pathing = require('path');
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { align, combine, colorize, timestamp, label, printf } = format;

const commonFormat = (origin, callback) => {
  return combine(
    label({ origin: origin }),
    timestamp({
      format: 'DD-MM-YY HH:mm:ss'
    }),
    align(),
    printf(callback)
  );
};

const genericConsoleFormatter = (origin, callback) => {
  return combine(
    colorize(),
    commonFormat(origin, callback)
  );
};

const genericFileFormatter = (origin, callback) => {
  return commonFormat(origin, callback);
};

const messageFormat = (info, optionals) => {
  return `${info.timestamp} (${info.level}) [${optionals.layer}${info.origin ? '-'+info.origin : ''}]: ${info.message}`
};

const systemFileFormatter = genericFileFormatter(null, (info) => {
  return messageFormat(info, {
    layer: 'system'
  });
});

module.exports = {
  context: winston,
  create: createLogger,
  commonFormats: {
    systemConsole: () => {
      return genericConsoleFormatter(null, (info) => {
        return messageFormat(info, {
          layer: 'system'
        });
      });
    },
    pluginConsole: (origin) => {
      return genericConsoleFormatter(origin, (info) => {
        return messageFormat(info, {
          layer: 'plugin'
        });
      });
    },
    pluginFile: (origin) => {
      return genericFileFormatter(origin, (info) => {
        return messageFormat(info, {
          layer: 'plugin'
        });
      });
    }
  },
  commonTransports: {
    console: (format) => {
      return new transports.Console({
        silent: !config.logging.console.enabled,
        format: format,
        level: 'silly'
      })
    },
    systemFile: new transports.File({
      silent: !config.logging.file.enabled,
      format: systemFileFormatter,
      level: 'silly',
      filename: `${pathing.resolve(config.logging.file.path)}/system.log`
    }),
    pluginFile: (format) => {
      return new transports.File({
        silent: !config.logging.file.enabled,
        format: format,
        level: 'silly',
        filename: `${pathing.resolve(config.logging.file.path)}/plugins.log`
      });
    }
  }
};
