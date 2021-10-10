const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    dist: path.resolve(
      __dirname,
      './index.ts',
    ),
  },
  externals: [
    nodeExternals({
      modulesFromFile: {
        exclude: ['dependencies'],
        include: ['devDependencies'],
      },
    }),
  ],
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
