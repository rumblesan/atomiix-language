/* global __dirname, require, module*/

const path = require('path');

const libraryName = 'atomiix';

module.exports = (env, argv) => {
  const outputName = `${libraryName}${
    argv && argv.mode === 'production' ? '.min.js' : '.js'
  }`;
  return {
    entry: path.resolve(__dirname, 'src/index.js'),
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: outputName,
      library: libraryName,
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    target: 'node',
    resolve: {
      modules: [path.resolve('./node_modules'), path.resolve('./src')],
      extensions: ['.json', '.js'],
    },
  };
};
