const glob = require('glob');
const jsonpath = require('jsonpath');
const helpers = require('./helpers');

const tryParseValue = (value) => {
  try {
    return JSON.parse(value); // object
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
  const result = { _collective: null };

  paths.forEach((path) => {
    let foundValue = jsonpath.query(
        helpers.readFile(path, true),
        inputs.keyQuery
      );

    if (foundValue.length > 0) {
      foundValue = foundValue[0];
    }

    if (
        // No value is found
        foundValue.length === 0 ||
        // If an expected value is given and is not equal to the found value.
        (inputs.value !== '*' && tryParseValue(inputs.value) !== foundValue)
      ) return;

    result._collective.without
    result[path.replace(sourceFolder, '~').replace('.json', '')] = foundValue;
  });

  return result;
};

module.exports = (sourceFolder, search, inputs) => {
  return processFiles(
    sourceFolder,
    getFilePaths(sourceFolder, search),
    inputs
  );
}
