const pluginEvent = require('signal-js');

module.exports = (id, eventRegister, config) => {
  eventRegister = new Map(Object.entries(eventRegister));

  if (!id || !config || (!eventRegister || eventRegister.size === 0)) {
    throw 'Failed to initialize plugin - Malformed plugin structure.';
  }

  // Check whether plugin is enabled, defaults to disabled
  if (config.enabled === false) {
    return;
  }

  eventRegister.forEach((event, eventName) => {
    pluginEvent.on(eventName, event);
  });

  console.log(`Using the "${id}" plugin!`);
};
