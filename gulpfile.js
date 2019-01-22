const gulp = require('gulp');
const readline = require('readline-sync');
const pluginLoader = require('./internals/plugin-system/loader');
const config = require('./internals/helpers').getConfig();

gulp.task('ui:query', async () => {
  console.log('Press ctrl + c to cancel');
  const port = Number(readline.question('Port: (Defaults to 3000) ') || 3000);

  pluginLoader(config.input.pluginFolder).then(() => {
    require('./frontend/server/web-api')(port);
  });
});

gulp.task('query', async () => {
  console.log('Press ctrl + c to cancel');
  const keyPath = readline.question('Enter key path: ');
  const expectedValue = readline.question('Enter the expected value: (Defaults to *) ');

  if (!keyPath) {
    console.log(`Don't be dumb...`);
    return;
  }

  pluginLoader(config.input.pluginFolder, true).then(() => {
    require('./internals/query-processor')(keyPath, expectedValue);
  });

gulp.task('debug', async () => {
  pluginLoader(config.input.pluginFolder).then(() => {
    await require('./internals/query-processor')(
      '',
      ''
    );
  });
});

gulp.task('clean', () => {
  require('trash')([
    config.output.resultFolder
  ]);
});
