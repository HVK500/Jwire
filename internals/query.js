const glob = require('glob');
const jsonpath = require('jsonpath'); // https://goessner.net/articles/JsonPath/index.html#e2
const helpers = require('./helpers');

const tryParseValue = (value) => {
  try {
    return JSON.parse(value); // object | array
  } catch (err) {
    return value; // string
  }
};

const getFilePaths = (sourceFolder, search) => {
  return glob.sync(search, {
    cwd: sourceFolder,
    nosort: true,
    absolute: true
  });
};

const processFiles = (sourceFolder, paths, inputs) => {
  const parsedValue = tryParseValue(inputs.value);
  const result = {
    _collective: {
      total: 0,
      matchs: 0,
      noMatchs: 0,
      fileWithNoValue: []
    }
  };

  paths.forEach((path) => {
    const queryFilePath = path.replace(sourceFolder, '~').replace('.json', '');
    const queryResult = jsonpath.nodes(
      helpers.readFile(path, true),
      inputs.keyQuery
    );

    if (queryResult.length === 0) {
      result._collective.fileWithNoValue.push(queryFilePath);
      return;
    }

    let generatedResult = false;
    const queryProcessedResult = {};
    queryResult.forEach((item) => {
      if (inputs.value !== '*' && ((!Array.isArray(item.value) && parsedValue !== item.value) || (Array.isArray(item.value) && !Array.isArray(parsedValue) && item.value.findIndex(value => value === inputs.value) === -1))) {
        result._collective.noMatchs++;
        return;
      }

      queryProcessedResult[item.path.join('.').replace('$.', '').replace(/\d+/g, match => `[${match}]`)] = item.value;
      generatedResult = true;
      result._collective.matchs++;
    });

    if (!generatedResult) return;
    result[queryFilePath] = queryProcessedResult;
  });

  result._collective.total = result._collective.matchs + result._collective.noMatchs;

  return result;
};

module.exports = (sourceFolder, search, inputs) => {
  return processFiles(
    sourceFolder,
    getFilePaths(sourceFolder, search),
    inputs
  );
}
