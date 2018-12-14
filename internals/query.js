const glob = require('glob');
const jsonata = require('jsonata');
const helpers = require('./helpers');

const getSubjectFilePaths = (sourceFolder, search) => {
  return glob.sync(search, {
    cwd: sourceFolder,
    nosort: true,
    absolute: true
  });
};

const processSubjectFiles = (paths, inputs) => {
  const expression = jsonata(inputs.keyQuery);
  const result = { collective: null };

  paths.forEach((path) => {
    const foundValue = expression.evaluate(helpers.readFile(path, true));

    if (foundValue == null || (inputs.value !== '*' && foundValue === JSON.parse(inputs.value))) return;

    result[helpers.getFileName(path)] = foundValue;
  });

  return result;
};

module.exports = (sourceFolder, search, inputs) => {
  return processSubjectFiles(
    getSubjectFilePaths(sourceFolder, search),
    inputs
  );
}
