const gulp = require('gulp');
const del = require('del');
const prompt = require('gulp-prompt');
const query = require('./internals/query');
const helpers = require('./internals/helpers');
const config = helpers.getConfig();

const process = (inputs) => {
  const result = query(
    config.sourceFolder,
    config.searchCriteria,
    inputs
  );

  // Output in file
  helpers.writeFile(
    `${config.outputFolder}/query-result-${helpers.formatTimeStamp()}.json`,
    JSON.stringify({
      query: inputs.keyQuery,
      matchValue: inputs.value,
      source: config.sourceFolder,
      results: result
    }, null, 2)
  );
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
    keyQuery: 'features.autoPlay.enabled', //'features.**.deviceAndOsRestricted.*.browserAndOS.**.browsers',
    value: '*'
  });
});

gulp.task('clean', () => {
  del([
    './results/*'
  ]);
});