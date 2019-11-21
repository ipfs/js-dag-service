const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const { resolveTsAliases } = require("resolve-ts-aliases")

const extensions = ['.ts', '.tsx', '.js', 'json']
const filename = 'ipfs-lite.[name].min.js'

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.ts',
    // core: './src/core/index.ts',
    // network: './src/network/index.ts',
    setup: './src/setup/index.ts',
    // files: './src/files/index.ts',
  },
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
    // @todo: Figure out how best to take advantage of this
    splitChunks: {
      chunks: 'all'
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        cache: true,
        terserOptions: {
          parse: {
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
          }
        },
      }),
    ],
  },
  target: 'web',
  resolve: {
    extensions,
    alias: {
      './bundle/node': './bundle/browser'
    }
  },
  performance: {
    hints: false
  },
  stats: 'minimal',
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
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
    // new HtmlWebpackPlugin({
    //   title: 'IPFS Lite App',
    //   template: 'src/index.ejs',
    // }),
    new CompressionPlugin({
      test: /\.js$/i,
    })
  ]
}
