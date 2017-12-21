Webpack Manifest Generator
--------------------------

Opinionated plugin to generate a manifest from your Webpack bundle.

### Features:

- The manifest data is ordered based on your chunks dependencies
- It outputs a recursive and structured file, so it's easier to parse

### Example output:

As you can see, it says in which order you should include the generated chunks

```json
{
  "id": "runtime",
  "js": [
    "/runtime.321d8cd98f88b204e981.js"
  ],
  "css": [],
  "next": {
    "id": "vendor",
    "js": [
      "/vendor.afe2c637bf43601eb749.js"
    ],
    "css": [],
    "next": {
      "id": "app",
      "js": [
        "/app.5cd24f1c12013a55a2d4.js"
      ],
      "css": [
        "/app.45d24f1c12013a55a2d4.css"
      ]
    }
  }
}
```

### Install

```bash
yarn add webpack-manifest-generator-plugin --dev
```

### Configuration

Import the plugin and add it to your webpack config:

```js
const WebpackManifestGeneratorPlugin = require('webpack-manifest-generator-plugin');

module.exports = {
  // ....
  plugins: [
    new WebpackManifestGeneratorPlugin(),
  ],
}
```

### Options

Currently, it accepts these options:

#### `path` (optional)
Destination path for your manifest file. Default is your webpack output path.
```js
new WebpackManifestGeneratorPlugin({
  path: path.join(__dirname, 'app', 'dist'),
}),
```

#### `filename` (optional)
Name of your manifest file. Default is `assets-manifest.json`
```js
new WebpackManifestGeneratorPlugin({
  filename: 'manifest.json',
}),
```

#### `extensions` (optional)
Whitelisted chunks extensions to include in the manifest. Default is `['js', 'css']`
```js
new WebpackManifestGeneratorPlugin({
  extensions: ['js', 'css'],
}),
```

#### `prettyPrint` (optional)
Whether to format the Json output for readability. Enabled by default.
```js
new WebpackManifestGeneratorPlugin({
  prettyPrint: false,
}),
```