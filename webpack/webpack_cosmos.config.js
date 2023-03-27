//@ts-check

'use strict';

const path = require('path');
const { merge } = require('webpack-merge');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');


//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  output: {
    path: path.resolve(__dirname, 'cosmos_dist'),
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
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {loader: "babel-loader"}
      }
    ]
  },
  plugins: [
    new NodePolyfillPlugin(),
    // new HtmlWebpackPlugin()
  ],
  experiments: {
    topLevelAwait: true
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

const browserConfig = {
  // entry: {
  //   'editor': './src/editor_frontend/editor_index.tsx'
  // },

  target: 'web',
  output: {
    libraryTarget: 'umd',
  },
};

module.exports = merge(extensionConfig, browserConfig);