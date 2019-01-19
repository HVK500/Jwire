const pathing = require('path');
const pluginEvent = require('./plugin-system/utils').events;
const pluginLoader = require('./plugin-system/loader');
const queryEngine = require('../internals/query-engine');
const helpers = require('../internals/helpers');
const config = helpers.getConfig();

module.exports = async (keyPath, expectedValue, callback) => {
  expectedValue = !expectedValue ? '*' : expectedValue;
  const inputs = {
    keyPath: keyPath,
    expectedValue: expectedValue
  };

  pluginLoader(config.input.pluginFolder);

  const resultBuilder = new helpers.objectBuilder();

  pluginEvent.emit('onBeforeQueryStart', config.input.sourceFolder, inputs);

  await queryEngine(config.input.sourceFolder, config.input.searchCriteria, inputs, resultBuilder.add);

  const queryResult = resultBuilder.output();
  helpers.writeFile(
    pathing.join(config.output.resultFolder, `query-result-${helpers.formatTimeStamp()}.json`),
    queryResult,
    true
  );

  callback ? callback(queryResult) : null;
};
