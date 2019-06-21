# How to Plug in!

## What are plugins and what are they for?

To put it simply, Jwire plugins are extendable interfaces that provide a means to handle structuring and/or filtering of a queries output data. This allows for flexiblity in visual analysis, as well as quick data extraction of very specific data within a very large json dataset.

## Creating a Plugin

Simply run the file `create-plugin.bat` or command `yarn plugin` and a new boilerplate plugin will be created in your configured plugins folder.

## Plugin Structure

### Source

The Jwire system requires each plugin to abide by a simple contract that requires a plugin to register itself to the system and listen for any specific query focused data it has been made for. This is expanded on as the plugin structure is explained below.

#### index.js

Any plugin is required to contain a `index.js`, as the name describes, this file is the core of the plugin.

- **subscribe** - A callback given to the plugin by the system, this allows the plugin to tell the system what events to listen for. Each signal provides different information that can be used by the plugin to do some specific processing. (Details on Signals are below in Query life-cycle section)
- **config** _(Optional usage)_ - This object contains the values saved in the plugins `config.json`, useful when the plugin allows adjustments in it behaviour.
- **utils** _(Optional usage)_ - A object that contains useful helper methods that can be used in the plugin. See the `utils` object in [plugin-utils.js](../internals/plugin-system/plugin-utils.js)

```javascript
module.exports = (subscribe, config, utils) => {
  return subscribe({
    // See the `Signals` sections for all the avalible query system hooks
    onProcessNode: () => {
      // Your logic here... Make magic happen!
    },
    onReturnOutput: () => {
      // Output processed goodness!
    }
    ...
  });
};

```

#### config.json

A configuration file can optionally be created to transport configuration information into your plugin. The follow properties will be read by the plugin-system if present in the file.

```javascript
{
  // Controls whether the plugin should be loaded by the plugin-system
  "enabled": true,
  // Controls in which order you want the data return to be in.
  // 1 being the highest priority, a higher number will place your result closer to the top of the output object. If no value is given then the system assigns a number to the plugin during loadtime. (Note: This assigned number may vary and is not constant.)
  "outputOrderPreference": 1
}

```

### Folder Structure

> Note: The **Plugins** folder is the folder you have configured in your Jwire config, under `pluginFolder`.

```
Plugins/
└── YourPlugin/
    ├── index.js
    └── config.json
```

Remember, a plugin is basically a npm module, so if your plugin needs specific special modules, you can simply create a `package.json` in your plugin folder and install what you need, require the modules in the plugin's `index.js`.

### Query Life-Cycle

When a query is submitted to the system if proceeds through the following flow:
![](https://www.plantuml.com/plantuml/svg/dLJ9Ri8m4BtxA-P89V8325Meg3cW2YXKgdeqoH0iZ9rweUNlEtO296uFq5oypLjcFCx4EcwSFqYMFSBiInWSmQj7SsAySEB87JQxZCK1A6efVINKY-ObcX7KdTNWuOhgHh7kuZT5ZgxO0PUo9RCW55JYYAhToBKCGAvAA4AOzHjR6B4XLuMM4abJ4-f3UzCmi-iKnbcMw5tWNRyTy3NLM8cbqGLQgmdvsLiFzdXQShSR0dxNP0BB5LelNOUrJy1INod_cn5LHPbgzOHRRJ2UhyCDiNxenTop8YvidJMBGPmtDHk2HMwAtTG8XqRm8PMsziwc5Xlat_xE4gcvrenGLIY2PQmosjVGRiE1qwrY2LiXqJAWhpdF1LtZRBsOWz8bneFm_KDvJdXx8UYh8wUMEble2Tqkrf6ve56LSOxI8eN0bWlfgLcSfaGfiIX99OcQzixiOa9pxNBjpp8qiji9flfGItJ9rTn1i4BdZLfuHqsImhAqvwRq5ctxKCExtF1Y7mh1op8C9Zu65bCO9uhleH_R2DiKJoARK2pzYdu0)

Each of the below are listeners that a plugin would subscribe to via the system, these will provide the details a plugin needs to process query results and output the collected information.

#### onBeforeQueryStart

First signal fired in the life-cycle, fired right before any found paths get processed, these paths depend on the given `searchCriteria` and `sourceFolder`. Signal provides the following:

```javascript
onBeforeQueryStart: (
  sourceFolder,       // { string }                    - The folder absolute path configured to be queried.
  inputs              // { object }
                      // ├─ keyPath       - { string } - The input JSON key path used to query the data.
                      // └─ expectedValue - { string } - The value expected to be found at the base of the given key path, this value can be * which means any value.
) => { }
```

#### onBeforeProcessingPaths

This signal is fired right before any found paths get processed, these paths depend on the given `searchCriteria` and `sourceFolder`. Signal provides the following:

```javascript
onBeforeProcessingPaths: (
  filePath,           // { string } - The folder absolute path configured to be queried.
  pathIndex,          // { string } - 
  fileContent         // { string } - 
) => { }
```

#### onNodesNotFound

```javascript
onNodesNotFound: (
  filePath,           // { string } - The folder absolute path configured to be queried.
  pathIndex,          // { string } - 
  fileContent         // { string } - 
) => { }
```

#### onBeforeProcessNodes

```javascript
onBeforeProcessNodes: (
  filePath,           // { string } - The folder absolute path configured to be queried.
  pathIndex,          // { string } - 
  fileContent         // { string } - 
  nodesCollection     // { string } - 
) => { }
```

#### onProcessNode

```javascript
onProcessNode: (
  node,               // { string } - 
  nodeIndex,          // { string } - 
  nodesCollection     // { string } - 
) => { }
```

#### onCompleteProcessingPath

```javascript
onCompleteProcessingPath: (
  filePath,          // { string } - 
  pathIndex,         // { string } - 
  fileContent,       // { string } - 
  nodesCollection    // { string } - 
) => { }
```

#### onReturnOutput

```javascript
onReturnOutput: (
  outputCallback     // { function } - 
) => { }
```
