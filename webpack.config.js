const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')

const extensions = ['.tsx', '.ts', '.js', 'json']
const filename = 'index.min.js'

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'ts-loader?configFile=tsconfig.webpack.json',
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        terserOptions: {
          output: {
            comments: false,
          }
        },
      }),
    ],
  },
  target: 'web',
  resolve: {
    extensions,
  },
  performance: {
    hints: false
  },
  stats: 'minimal',
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
    console: false,
    global: true,
    process: true,
    __filename: 'mock',
    __dirname: 'mock',
    Buffer: true,
    setImmediate: true
  },
  output: {
    filename,
    sourceMapFilename: filename + '.map',
    path: path.resolve(path.join(__dirname, 'dist', 'browser')),
    library: 'ipfsLite',
    libraryTarget: 'window'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin(),
    new CompressionPlugin({
      test: /\.js$/i,
    })
  ]
}
