const ax = require('axios');

module.exports = {
  sendQuery: (keyPath, expectedValue) => {
    return ax({
      method: 'GET',
      url: '/query',
      params: {
        keyPath: keyPath,
        expectedValue: expectedValue
      },
      responseType: 'json'
    });
  }
};
