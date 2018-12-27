const jsonpath = require('jsonpath'); // https://goessner.net/articles/JsonPath/index.html#e2
const helpers = require('./helpers');

const valueProcessor = () => {
  let hasLeastOneValueAdded = false;
  const result = {};

  return {
    add: (key, value) => {
      hasLeastOneValueAdded = true;
      result[key] = value;
    },
    hasGeneratedResult: () => hasLeastOneValueAdded,
    output: () => {
      return result;
    }
  };
};

const metadataProcessor = () => {
  const result = {
    matches: 0,
    noMatches: 0,
    totalFiles: 0,
    filesWithNoValue: []
  };

  return {
    addFileWithNoValue: (filePath) => {
      result.filesWithNoValue.push(filePath);
    },
    bumpMatch: () => {
      result.matches++;
    },
    bumpNoMatch: () => {
      result.noMatches++;
    },
    output: () => {
      result.totalFiles = result.matches + result.noMatches;
      return result;
    }
  };
};

const processFiles = (sourceFolder, paths, inputs) => {
  const parsedValue = helpers.tryParseValue(inputs.value);
  const metadata = metadataProcessor();
  const queryResult = valueProcessor();

  paths.forEach((path) => {
    const queryFilePath = path.replace(sourceFolder, '~').replace('.json', '');
    const queryNodes = jsonpath.nodes(
      helpers.readFile(path, true),
      inputs.keyQuery
    );

    // No result found in current file
    if (queryNodes.length === 0) {
      metadata.addFileWithNoValue(queryFilePath);
      return;
    }

    const queryProcessedResult = valueProcessor();
    queryNodes.forEach((item) => {
      if (inputs.value !== '*' && ((!Array.isArray(item.value) && parsedValue !== item.value) || (Array.isArray(item.value) && !Array.isArray(parsedValue) && item.value.findIndex(value => value === inputs.value) === -1))) {
        metadata.bumpNoMatch();
        return;
      }

      queryProcessedResult.add(item.path.join('.').replace('$.', '').replace(/\d+/g, match => `[${match}]`), item.value);
      metadata.bumpMatch();
    });

    if (!queryProcessedResult.hasGeneratedResult()) return;
    queryResult.add(queryFilePath, queryProcessedResult.output());
  });

  return {
    metadata: metadata.output(),
    queryResult: queryResult.output()
  };
};

module.exports = (sourceFolder, search, inputs) => {
  return processFiles(
    sourceFolder,
    helpers.getFilePaths(sourceFolder, search),
    inputs
  );
}
