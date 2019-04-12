const queryProcessor = require('../../internals/query-processor');
const { loopObject, readFile, getFileExtension } = require('../../internals/helpers');

module.exports = {
  setupResourceRoutes: (api, resourceMap) => {
    loopObject(resourceMap, (type, assetCollection) => {
      loopObject(assetCollection, (id, path) => {
        readFile(path).then((content) => {
          const fileExtension = getFileExtension(path);

          if (type !== 'pages') {         // other resource
            route = `/${type}/${id}`;
          } else {                        // html resource
            switch (id) {
              case 'home':
                route = '/';
                break;
              default:
                route = `/${id}`;
            }
          }

          api.get(route, (request, response) => {
            response.type(fileExtension);
            response.send(content);
          });
        });
      });
    });
  },
  setupApiRoutes: (api) => {
    api.get('/query', async (request, response) => {
      await queryProcessor(
        request.param('keyPath'),
        request.param('expectedValue'),
        (output) => {
          response.send(output);
        }
      );
    });
  }
};
