//@ts-check

'use strict';

const path = require('path');
const { merge } = require('webpack-merge');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");


//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    'tree-sitter': 'commonjs tree-sitter',
    'tree-sitter-javascript': 'commonjs tree-sitter-javascript',
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
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

const nodeConfig = {
  entry: {
    'json_writer': './src/stories/jsonWriter.js',
  },

  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
  },
  devtool: 'nosources-source-map',
};

module.exports = merge(extensionConfig, nodeConfig);