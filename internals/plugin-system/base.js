const pluginEvent = require('./utils').events;

module.exports = (id, eventRegister, config = {}) => {
  eventRegister = new Map(Object.entries(eventRegister));

  if (!id || (!eventRegister || eventRegister.size === 0)) {
    throw `${id ? '['+id+'] ' : ''}Failed to initialize plugin - Malformed plugin structure.`;
  }

  pluginEvent.off(id);

  // Check whether plugin is enabled, defaults to enabled
  if (config.enabled === false) {
    return;
  }

  eventRegister.forEach((event, eventName) => {
    pluginEvent.on(eventName, id, event);
  });

  console.log(`Using the "${id}" plugin!`); // TODO: Add proper logging
};
