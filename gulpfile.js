const gulp = require('gulp');
const readline = require('readline-sync');
const pluginLoader = require('./internals/plugin-system/plugin-loader');
const config = require('./internals/helpers').getSystemConfig();

gulp.task('ui:query', async () => {
  console.log('Use `$.` as your root path and use `..` to deep search');
  console.log('Press ctrl + c to cancel');
  const port = Number(readline.question('Port: (Defaults to 3000) ') || 3000);

  await pluginLoader(config.input.pluginFolder);
  require('./frontend/server/web-api')(port);
});

gulp.task('query', async () => {
  console.log('Use `$.` as your root path and use `..` to deep search');
  console.log('Press ctrl + c to cancel');
  const keyPath = readline.question('Enter key path: ');
  const expectedValue = readline.question('Enter the expected value: (Defaults to *) ');

  if (!keyPath) {
    console.log('No key path given...');
    return;
  }

  await pluginLoader(config.input.pluginFolder, true);
  await require('./internals/query-processor')(keyPath, expectedValue);
});

// gulp.task('debug', async () => {
//   await pluginLoader(config.input.pluginFolder)
//   // .then(() => {
//   //   // Add debug code here
//   // });
// });

gulp.task('clean', () => {
  require('trash')([
    config.output.resultFolder
  ]);
});
