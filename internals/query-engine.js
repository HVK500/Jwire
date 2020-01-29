const events = require('./events');
const jsonpath = require('jsonpath');
const { tryParseValue, getFilePaths, log, readFile } = require('./helpers');

const processFiles = async (sourceParentFolder, sourceFilePaths, inputs, outputCallback) => {
  const parsedInputValue = tryParseValue(inputs.expectedValue);
  events.emit('onBeforeProcessingPaths', sourceParentFolder, sourceFilePaths, inputs, parsedInputValue);

  return Promise.all(sourceFilePaths.map((path, pathIndex) => {
    const filePath = path.replace(/\\/g, '/')
      .replace(sourceParentFolder, '~')
      .replace('.json', '');

    return readFile(path, true)
      .then((fileContent) => {
        const nodesCollection = jsonpath.nodes(fileContent, inputs.keyPath);

        // No result found in current file
        if (nodesCollection.length === 0) {
          events.emit('onNodesNotFound', filePath, pathIndex, fileContent);
        } else {
          events.emit('onBeforeProcessNodes', filePath, pathIndex, fileContent, nodesCollection);

          nodesCollection.forEach((node, nodeIndex) => {
            if (inputs.expectedValue !== '*' && ((!Array.isArray(node.value) && parsedInputValue !== node.value) || (Array.isArray(node.value) && !Array.isArray(parsedInputValue) && node.value.findIndex(value => value === inputs.expectedValue) === -1))) {
              return;
            }

            events.emit('onProcessNode', node, nodeIndex, nodesCollection);
          });
        }

        events.emit('onCompleteProcessingPath', filePath, pathIndex, fileContent, nodesCollection);
      }).catch((error) => {
        log.error(`Skipping file because - ${error}`);
      });
  })).then(() => {
    events.emit('onReturnOutput', outputCallback);
  });
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
