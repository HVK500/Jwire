const gulp = require('gulp');
const del = require('del');
const prompt = require('gulp-prompt');
const pluginLoader = require('./internals/plugin-loader');
const query = require('./internals/query');
const helpers = require('./internals/helpers');
const config = helpers.getConfig();

const process = (inputs) => {
  pluginLoader.init(config.input.pluginFolder, (plugins) => {
    const result = query(
      config.input.sourceFolder,
      config.input.searchCriteria,
      inputs,
      plugins
    );

    // Output in file
    helpers.writeFile(
      `${config.output.resultFolder}/query-result-${helpers.formatTimeStamp()}.json`,
      {
        query: inputs.keyQuery,
        matchValue: inputs.value,
        source: config.input.sourceFolder,
        results: result.queryResult,
        _metadata: result.metadata
      },
      true
    );
  });
};

gulp.task('query', () => {
  gulp.src('./gulpfile.js')
    .pipe(prompt.prompt([
      {
        type: 'input',
        name: 'keyQuery',
        message: 'Enter key query:',
        default: null
      },
      {
        type: 'input',
        name: 'value',
        message: 'Enter the expected value:',
        default: '*'
      }], (inputs) => {
        if (!inputs.keyQuery) {
          console.log(`Don't be dumb...`);
          return;
        }

        process(inputs);
      })
    );
});

gulp.task('default', () => {
  process({
    keyQuery: '$..enabled',
    value: 'true'
  });
});

gulp.task('clean', () => {
  del([
    './results'
  ]);
});