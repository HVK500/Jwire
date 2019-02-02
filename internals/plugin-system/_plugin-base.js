const pluginUtils = require('./utils');

// pass in the index module and execute the constuctor of the plugin base 

module.exports = function (module) {
  this.utils = pluginUtils;
  this.properties = properties;

  

  this.register = function (id, eventRegister) {
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
}
