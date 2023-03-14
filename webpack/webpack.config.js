//@ts-check

'use strict';

const path = require('path');
const { merge } = require('webpack-merge');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");


//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  // target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file

    'web-tree-sitter': 'commonjs web-tree-sitter',
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js', '.tsx', '.jsx'],

    alias: {
      // Use the "process/browser" package as a polyfill for "process"
      process: 'process/browser'
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
    ]
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

const browserConfig = {
  entry: {
    'editor': './src/editor_frontend/editor_index.tsx'
  },

  target: 'web',
  output: {
    libraryTarget: 'umd',
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
};

const nodeConfig = {
  entry: {
    'extension': './src/extension.ts',
  },

  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
  },
};

module.exports = [merge(extensionConfig, browserConfig), merge(extensionConfig, nodeConfig)];