const helpers = require('../../internals/helpers');

module.exports = {
  setupResourceRoutes: (resourceMap, api) => {
    helpers.loopObject(resourceMap, (type, assetCollection) => {
      helpers.loopObject(assetCollection, (id, path) => {
        const content = helpers.readFile(path);
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
  },
  setupApiRoutes: (api) => {

  }
};
