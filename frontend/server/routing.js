const queryProcessor = require('../../internals/query-processor');
const helpers = require('../../internals/helpers');

module.exports = {
  setupResourceRoutes: (resourceMap, api) => {
    helpers.loopObject(resourceMap, (type, assetCollection) => {
      helpers.loopObject(assetCollection, (id, path) => {
        helpers.readFile(path).then(content => {
          const fileExtension = helpers.getFileExtension(path);

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
