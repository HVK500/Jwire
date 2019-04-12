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
    * Point the `sourceFolder` path to the folder that contains the `.json` dataset files you intend to query.
    * Fill in `searchCriteria` with the specific glob string that will be used to choose the exact `.json` files from the configured `sourceFolder` path. (This can be used as a black/white list, depending on the provided glob string, of course.)
    * Point the `pluginFolder` to the folder that contains your plugins.
    * Point the `resultFolder` to the path you wish the query results output to be saved.
3. Confirm there are valid / enabled plugin(s) to generate an output for your queries. (this would be in the configured path referred above) **(Note: At least one valid plugin must be enabled to generate an output)**
4. Run either
    * `run.bat` (console based interface, intended for single query usage)
    * `ui-run.bat` (Web UI based interface, intended for a session of queries until the interface is shutdown)

#### Scripts available

* `install.bat` - Handles installing all dependant packages as well as bundles the UI components so they ready to use.
* `run.bat` - Starts a console based query which asks sequential questions and outputs the result in the configured `resultFolder`.
* `ui-run.bat` - Starts the Web UI on the port specified and opens the UI in your browser.
* `clean.bat` - Removes the configured `resultFolder` (moves it to the recycle bin), this is intending for when you need to start fresh.

> Note: Admin permissions not needed when running the referred script files.

### How to query your data?

Use the following guides to figure out how to use `JSON Path` to query the specfic data you need out of your large datasets. (I promise, its easy)
* [JsonPath Syntax](https://github.com/dchester/jsonpath#jsonpath-syntax)
* [goessner.net/articles/JsonPath](https://goessner.net/articles/JsonPath/index.html#e2)

### Plugins?

See the documentation on what a plugin is, how to create and wire up a plugin of your own - [How to Plug in!](./PLUGINS.md)

## Built With


* [Node](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/en/)
  * [gulp](https://gulpjs.com/)
  * [jsonpath](https://github.com/dchester/jsonpath#readme/)
  * [nanoevents](https://github.com/ai/nanoevents#readme)
  * [express](https://expressjs.com/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details
