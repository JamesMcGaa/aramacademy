const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: './index.html',
  favicon: 'src/images/favicon.ico',
});
module.exports = {
  devServer: {
    port: 8000,
  },
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
  plugins: [htmlPlugin, new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options: { name: 'static/[name].[ext]' },
      },
      {
        test: /\.txt$/,
        use: 'raw-loader',
      },
    ],
  },
};
