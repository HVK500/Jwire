module.exports = (properties) => {
  const pluginUtils = require('./utils');
  const pluginEvent = pluginUtils.events;

  return {
    utils: pluginUtils.utils,
    properties: properties,
    register: function (id, eventRegister) {
      eventRegister = new Map(Object.entries(eventRegister));

      if (!id || (!eventRegister || eventRegister.size === 0)) {
        throw `${id ? '['+id+'] ' : ''}Failed to initialize plugin - Malformed plugin structure.`;
      }

      // Get rid of all event for the given id
      pluginEvent.off(id);

      // Check whether plugin is enabled, defaults to enabled
      if (this.properties.config.enabled === false) {
        console.log(`Disabled "${id}" plugin!`); // TODO: Add proper logging
        return;
      }

      eventRegister.forEach((event, eventName) => {
        pluginEvent.on(eventName, this.properties.guid, event);
      });

      console.log(`Using the "${id}" plugin!`); // TODO: Add proper logging
    }
  };
};
