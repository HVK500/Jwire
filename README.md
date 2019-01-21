# JWire

Query values from your JSON file(s) and output the results in a structure you define.

#### Whats with the name?

Couldn't use JQuery for obvious reasons, so mixed the words, JSON + Inquire = JWire

## Getting Started

**Prerequisites**

* [Node](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/en/)

## Usage

1. Run `install.bat`
2. Open and configure this tools `config.json` file
    * Point the `sourceFolder` path to the folder that contains all of your `.json` files.
    * Fill in `searchCriteria` with your establish specific criteria that will be used to choose the exact `.json` files from the configured `sourceFolder` path.
    * (Optional) You may point the `pluginFolder` to different path in which the system will search for enabled plugins.
    * (Optional) You may point the `resultFolder` to the path you wish you store your query results.
3. Confirm there are valid / enabled plugin(s) to generate an output for your queries. (this would be in the configured path referred above) **(Note: At least one valid plugin must be enabled to generate an output)**
4. Run either
    * `run.bat` (console based interface)
    * `ui-run.bat` (Web UI based interface)

#### Scripts available

* `install.bat` - Handles installing all dependant packages as well as bundles the UI components so they ready to use.
* `run.bat` - Starts a console based query which asks sequential questions and outputs the result in the configured `resultFolder`.
* `ui-run.bat` - Starts the Web UI on the port specified and opens the UI in your browser.
* `clean.bat` - Removes the configured `resultFolder` (moves it to the recycle bin), this is intending for when you need to start fresh.

> Note: Admin permissions not needed when running the referred script files.

### How to query your data?

Use this guide to figure out the key path you would need to provide in order to produce a result.

* [JsonPath Syntax](https://github.com/dchester/jsonpath#jsonpath-syntax)
* [goessner.net/articles/JsonPath](https://goessner.net/articles/JsonPath/index.html#e2)


### Plugins?

See the documentation on what a plugin is and how to create and wire up a plugin of your own - [How to Plug in!](./PLUGINS.md)

## Built With

Thanks to those who built the follow wonderful projects to build upon.

* [Node](https://nodejs.org/en/) - It's Node.js.
* [Yarn](https://yarnpkg.com/en/) - Efficient package manager.
  * [gulp](https://gulpjs.com/) - A task based automation layer that allows js written tasks to be run via varying means of execution. e.g. command line / script.
  * [jsonpath](https://github.com/dchester/jsonpath#readme/) - A package that is the heart of project and exposes a powerful query interface to interact with when searching large sets of JSON data.
  * [nanoevents](https://github.com/ai/nanoevents#readme) - Small pubsub event engine that has been wrapped for plugins to interface with the query system.
  * [express](https://expressjs.com/) - A web framework that drives the Web API used for the User interface for the tool.


## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details
