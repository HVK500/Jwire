const pluginEvent = require('signal-js');
const pluginLoader = require('../internals/plugin-loader');
const helpers = require('../internals/helpers');
const queryEngine = require('../internals/query-engine');
const config = helpers.getConfig();

module.exports = (keyPath, expectedValue, callback) => {
  expectedValue = !expectedValue ? '*' : expectedValue;
  const inputs = {
    keyPath: keyPath,
    expectedValue: expectedValue
  };

  pluginLoader(config.input.pluginFolder)
    .then(() => {
      const resultBuilder = helpers.objectBuilder();

      pluginEvent.trigger('onBeforeQueryStart', config.input.sourceFolder, inputs);

      queryEngine(config.input.sourceFolder, config.input.searchCriteria, inputs, resultBuilder.add);

      helpers.writeFile(
        `${config.output.resultFolder}/query-result-${helpers.formatTimeStamp()}.json`,
        resultBuilder.output(),
        true
      );

      callback ? callback(resultBuilder.output()) : null;
    })
    .catch((err) => {
      console.log(err);
    });
};
