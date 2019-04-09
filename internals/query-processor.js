const pathing = require('path');
const pluginEvent = require('./plugin-system/utils').events;
const queryEngine = require('../internals/query-engine');
const { getSystemConfig, objectBuilder, formatTimeStamp, writeFile } = require('../internals/helpers');
const config = getSystemConfig();

module.exports = async (keyPath, expectedValue, returnCallback) => {
  expectedValue = !expectedValue ? '*' : expectedValue;
  const inputs = {
    keyPath: keyPath,
    expectedValue: expectedValue
  };

  const resultBuilder = new objectBuilder();

  pluginEvent.emit('onBeforeQueryStart', config.input.sourceFolder, inputs);

  queryEngine(config.input.sourceFolder, config.input.searchCriteria, inputs, resultBuilder.add)
    .then(() => {
      const queryResult = resultBuilder.output();
      writeFile(
        pathing.join(config.output.resultFolder, `query-result-${formatTimeStamp()}.json`),
        queryResult,
        true
      );

      // Passes the query result back to the given callback
      if (returnCallback) {
        returnCallback(queryResult);
      }
    });
};
