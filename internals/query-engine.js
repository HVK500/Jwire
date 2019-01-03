const jsonpath = require('jsonpath'); // https://goessner.net/articles/JsonPath/index.html#e2
const pluginEvent = require('signal-js');
const helpers = require('./helpers');

const processFiles = (sourceParentFolder, sourceFilePaths, inputs, outputCallback) => {
  const parsedInputValue = helpers.tryParseValue(inputs.value);

  pluginEvent.trigger('onBeforeProcessingPaths', sourceParentFolder, sourceFilePaths, inputs, parsedInputValue);

  sourceFilePaths.forEach((path, pathIndex) => {
    const filePath = path.replace(sourceParentFolder, '~').replace('.json', '');
    const fileContent = helpers.readFile(path, true);
    const nodesCollection = jsonpath.nodes(
      fileContent,
      inputs.keyPath
    );

    // No result found in current file
    if (nodesCollection.length === 0) {
      pluginEvent.trigger('onNodesNotFound', filePath, pathIndex, fileContent);
      return;
    }

    pluginEvent.trigger('onBeforeProcessNodes', filePath, pathIndex, fileContent, nodesCollection);
    let hasGeneratedResult = false;
    nodesCollection.forEach((node, nodeIndex) => {
      if (inputs.expectedValue !== '*' && ((!Array.isArray(node.value) && parsedInputValue !== node.value) || (Array.isArray(node.value) && !Array.isArray(parsedInputValue) && node.value.findIndex(value => value === inputs.expectedValue) === -1))) {
        return;
      }

      pluginEvent.trigger('onProcessNode', node, nodeIndex, nodesCollection);
      hasGeneratedResult = true;
    });

    if (!hasGeneratedResult) return;
    pluginEvent.trigger('onCompleteProcessingPath', filePath, pathIndex, fileContent, nodesCollection);
  });

  pluginEvent.trigger('onReturnOutput', outputCallback);
};

module.exports = (sourceFolder, search, inputs, outputCallback) => {
  return processFiles(
    sourceFolder,
    helpers.getFilePaths(sourceFolder, search),
    inputs,
    outputCallback
  );
};
