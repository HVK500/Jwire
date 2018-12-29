const gulp = require('gulp');
const del = require('del');
const readline = require('readline-sync');
const queryProcessor = require('./internals/query-processor');
const helpers = require('./internals/helpers');
const config = helpers.getConfig();

gulp.task('query', () => {
  const keyQuery = readline.question('Enter key query: ');
  const value = readline.question('Enter the expected value: ') || '*';

  if (!keyQuery) {
    console.log(`Don't be dumb...`);
    return;
  }

  queryProcessor({
    keyQuery: keyQuery,
    value: value
  });
});

gulp.task('debug', () => {
  queryProcessor({
    keyQuery: '',
    value: ''
  });
});

gulp.task('clean', () => {
  del([
    config.output.resultFolder
  ]);
});