# How to Plug in!

## What are plugins and what are they for?

To put it simply, Jwire plugins are extendable interfaces that provide a means to handle structuring and/or filtering of a queries output data. This allows for flexiblity in visual analysis, as well as quick data extraction of very specific data within a very large json dataset.

## Plugin Structure

### Source

The Jwire system requires each plugin to abide by a simple contract that require a plugin to register itself to the system and listen for any specific query focused data it has been made for. This is expanded on as the plugin structure is explained below.

#### index.js

Any plugin is required to contain a `index.js`, as the name describes, this file is the core of the plugin.

```javascript
// The plugin is passed a base to extend off of, this must be executed an returned as follows:
module.exports = (subscribe, config, utils) => {
  return pluginBase(
    // An id must be provided for each plugin, it can be anything as long as it is unique.
    'my-first-plugin',
    {
      // See the `Signals` sections for avalible plugin information hooks
      onProcessNode: (sourceFolder, sourceFilePaths, inputs, parsedInputValue) => {
        // Your logic here
      },
      ...
    },
    // Pass the config in if you wish to use it
    config
  );
};

```

#### config.json

A configuration file can optionally be created to transport configuration information into your plugin. The follow properties will be read by the plugin-system if present in the file.

```javascript
{
  // Controls whether the plugin should be loaded by the plugin-system
  "enabled": true,
  // Controls in which order you want the data return to be in.
  // 1 is highest priority, a higher number will yield your result further from the top of the output object. If no value is given then the system assigns a number to the plugin during loadtime. (Note: This assigned number may vary and is not constant.)
  "outputOrderPreference": 1
}

```

### Folder structure

```
Plugins/
└── YourPluginName/
    ├── index.js
    └── config.json
```
> Note: The Plugins folder is the folder you have configured in your Jwire config, under `pluginFolder`.

### Signals

Each of the below are

##### onBeforeProcessingPaths
```javascript
onBeforeProcessingPaths: (sourceFolder, sourceFilePaths, inputs, parsedInputValue) => {
  // sourceFolder { string } -
  // sourceFilePaths { string[] } -
  // inputs { object }
  //  - keyPath { string } - The
  //  - expectedValue { string } -
  // parsedInputValue { any } -
}
```
