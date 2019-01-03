const gulp = require('gulp');
const readline = require('readline-sync');
const config = require('./internals/helpers').getConfig();

gulp.task('ui:query', () => {
  console.log('Press ctrl + c to cancel');
  const port = Number(readline.question('Port: (Defaults to 3000) ') || 3000);

  require('./frontend/server/web-api')(port);
});

gulp.task('query', () => {
  console.log('Press ctrl + c to cancel');
  const keyPath = readline.question('Enter key path: ');
  const expectedValue = readline.question('Enter the expected value: (Defaults to *) ');

  if (!keyPath) {
    console.log(`Don't be dumb...`);
    return;
  }

  require('./internals/query-processor')(keyPath, expectedValue);
});

gulp.task('debug', () => {
  queryProcessor({
    keyQuery: '',
    value: ''
  });
});

gulp.task('clean', () => {
  require('del')([
    config.output.resultFolder
  ]);
});
