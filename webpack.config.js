let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let rules = require('./webpack.config.rules')();
let path = require('path');

rules.push({
  test: /\.css$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: 'css-loader',
  }),
  // test: /\.scss$/,
  // use: ExtractTextPlugin.extract({
  //   fallback: 'style-loader',
  //   use: ['css-loader', 'sass-loader']
  // }),
});

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'friendsFilter.js',
    path: path.resolve('dist'),
    publicPath: '/',
  },
  devtool: 'none',
  module: { rules },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        drop_debugger: false,
        warnings: false,
      },
    }),
    new ExtractTextPlugin('style.css'),
    new HtmlPlugin({
      title: 'Friends Filter',
      template: './src/index.hbs',
    }),
    new CleanWebpackPlugin(['dist']),
  ],
};
