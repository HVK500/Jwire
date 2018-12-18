const glob = require('glob');
const jsonata = require('jsonata');
const helpers = require('./helpers');

const tryParseValue = (value) => {
  try {
    return JSON.parse(value); // object
  } catch (err) {
    return value; // string
  }
};

const getSubjectFilePaths = (sourceFolder, search) => {
  return glob.sync(search, {
    cwd: sourceFolder,
    nosort: true,
    absolute: true
  });
};

const processSubjectFiles = (sourceFolder, paths, inputs) => {
  const expression = jsonata(inputs.keyQuery);
  const result = { _collective: null };

  paths.forEach((path) => {
    const foundValue = expression.evaluate(helpers.readFile(path, true));

    if (
        // No value is found
        foundValue == null ||
        // If an expected value is given and is not equal to the found value.
        (inputs.value !== '*' && tryParseValue(inputs.value) !== foundValue)
      ) return;

    result[path.replace(sourceFolder, '~').replace('.json', '')] = foundValue;
  });

  return result;
};

module.exports = (sourceFolder, search, inputs) => {
  return processSubjectFiles(
    sourceFolder,
    getSubjectFilePaths(sourceFolder, search),
    inputs
  );
}
