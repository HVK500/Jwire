const jsonpath = require('jsonpath'); // https://goessner.net/articles/JsonPath/index.html#e2
const pluginEvent = require('./plugin-system/utils').events;
const { tryParseValue, getFilePaths, log, readFile } = require('./helpers');

const processFiles = (sourceParentFolder, sourceFilePaths, inputs, outputCallback) => {
  const parsedInputValue = tryParseValue(inputs.expectedValue);
  pluginEvent.emit('onBeforeProcessingPaths', sourceParentFolder, sourceFilePaths, inputs, parsedInputValue);

  sourceFilePaths.forEach((path, pathIndex) => {
    const filePath = path
      .replace(/\\/g, '/')
      .replace(sourceParentFolder, '~')
      .replace('.json', '');

    readFile(path, true)
      .then((fileContent) => {
        const nodesCollection = jsonpath.nodes(
          fileContent,
          inputs.keyPath
        );

        // No result found in current file
        if (nodesCollection.length === 0) {
          pluginEvent.emit('onNodesNotFound', filePath, pathIndex, fileContent);
        } else {
          pluginEvent.emit('onBeforeProcessNodes', filePath, pathIndex, fileContent, nodesCollection);
          nodesCollection.forEach((node, nodeIndex) => {
            if (inputs.expectedValue !== '*' && ((!Array.isArray(node.value) && parsedInputValue !== node.value) || (Array.isArray(node.value) && !Array.isArray(parsedInputValue) && node.value.findIndex(value => value === inputs.expectedValue) === -1))) {
              return;
            }
            pluginEvent.emit('onProcessNode', node, nodeIndex, nodesCollection);
          });
        }
        pluginEvent.emit('onCompleteProcessingPath', filePath, pathIndex, fileContent, nodesCollection);
      })
      .catch((error) => {
        log.error(`Skipping file because - ${error}`);
      });
  });

  pluginEvent.emit('onReturnOutput', outputCallback);
};

module.exports = async (sourceFolder, search, inputs, outputCallback) => {
  const sourceFilePaths = await getFilePaths(sourceFolder, search);

  return processFiles(
    sourceFolder,
    sourceFilePaths,
    inputs,
    outputCallback
  );
};
