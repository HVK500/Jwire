const gulp = require('gulp');
const pluginLoader = require('./internals/plugin-system/plugin-loader');
const readline = require('readline-sync');
const { getSystemConfig } = require('./internals/helpers');
const config = getSystemConfig();

gulp.task('ui:query', async () => {
  console.log('Press ctrl + c to cancel');
  const port = Number(readline.question('Port: (Defaults to 3000) ') || 3000);

  await pluginLoader(config.input.pluginFolder);
  require('./frontend/server/web-api')(port);
});

gulp.task('query', async () => {
  console.log('Press ctrl + c to cancel');
  const keyPath = readline.question('Enter key path: ');
  const expectedValue = readline.question('Enter the expected value: (Defaults to *) ');

  if (!keyPath) {
    console.log('Don\'t be dumb...');
    return;
  }

  await pluginLoader(config.input.pluginFolder, true);
  await require('./internals/query-processor')(keyPath, expectedValue);
});

gulp.task('debug', async () => {
  await pluginLoader(config.input.pluginFolder)
  // .then(() => {
  //   // Add debug code here
  // });
});

gulp.task('clean', () => {
  require('trash')([
    config.output.resultFolder
  ]);
});
