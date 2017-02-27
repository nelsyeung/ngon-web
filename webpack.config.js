const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

const buildDir = path.resolve(__dirname, 'dist');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: path.join('js', 'index.js'),
  devtool: 'source-map',
  output: {
    path: buildDir,
    filename: 'script.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader', 'eslint-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer,
                ],
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        }),
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve('src'),
    ],
    extensions: ['.js'],
  },
  devServer: {
    contentBase: buildDir,
    port: 3000,
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new StyleLintPlugin({
      syntax: 'scss',
    }),
  ],
};
