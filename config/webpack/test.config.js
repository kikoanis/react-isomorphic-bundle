'use strict';

import webpack from 'webpack';
import path from 'path';
import {isArray} from 'lodash';
import autoprefixer from 'autoprefixer';
import csswring from 'csswring';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import bemLinter from 'postcss-bem-linter';
import postReporter from 'postcss-reporter';
import postImport from 'postcss-import';
import postInclude from 'postcss-include';
import postColorFn from 'postcss-color-function';
import postPrecss from 'precss';

const writeStats = require('webpack/utils/write-stats');
const writeAdminStats = require('webpack/utils/write-admin-stats');
const LOCAL_IP = require('dev-ip')();
const PROTOCOL = 'http';
const HOST = isArray(LOCAL_IP) && LOCAL_IP[0] || LOCAL_IP || 'localhost';
const PORT = process.env.PORT || 3000;
const PUBLIC_PATH = `${PROTOCOL}://${HOST}:${PORT}/assets/`;

require('webpack/utils/clean-dist')();

export default {
  server: {
    port: PORT,
    options: {
      publicPath: PUBLIC_PATH,
      hot: true,
      historyApiFallback: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
      stats: {
        assets: true,
        colors: true,
        version: false,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false
      }
    }
  },
  webpack: {
    devtool: 'source-map',
    entry: {
      app: [
        './src/client/index',
        './src/client/fallback'
      ],
      admin: [
        './src/client/admin',
        './src/client/fallback'
      ]
    },
    output: {
      path: path.join(__dirname, '../../public/assets/'),
      filename: '[name]-[hash].js',
      chunkFilename: '[name]-[hash].js',
      publicPath: PUBLIC_PATH
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery"
      }),
      new ExtractTextPlugin('[name]-[hash].css'),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.DefinePlugin({
        'process.env': {
          BROWSER: JSON.stringify(true),
          NODE_ENV: JSON.stringify('debug')
        },
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          sequences: true,
          dead_code: true,
          drop_debugger: true,
          comparisons: true,
          conditionals: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          if_return: true,
          join_vars: true,
          cascade: true,
          drop_console: true
        },
        output: {
          comments: false
        }
      }),
      function () {
        this.plugin('done', writeStats);
        this.plugin('done', writeAdminStats);
      }
    ],
    module: {
      preLoaders: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|styles)/,
          loader: 'eslint'
        }
      ],
      loaders: [
        { test: /\.json$/, loaders: ['json'] },
        {
          test: /\.(woff2?|eot|ttf)$/,
          loader: 'url?limit=10000&name=[sha512:hash:base64:7].[ext]'
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/,
          loader: 'url?limit=10000&name=[sha512:hash:base64:7].[ext]!image?optimizationLevel=7&progressive&interlaced'
        },
        {
          test: /\.jsx?$/,
          loader: 'babel?optional[]=runtime&stage=0',
          exclude: (/node_modules|styles/)
        },
        { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap&importLoaders=1!postcss') },
        { test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!less?noIeCompat') }
      ]
    },
    postcss: {
        defaults: [postImport, postInclude, autoprefixer, csswring, bemLinter, postReporter, postPrecss, postColorFn],
        cleaner:  [autoprefixer({ browsers: [] })]
    },
    resolve: {
      extensions: ['', '.js', '.jsx', '.json', '.less', '.css'],
      modulesDirectories: ['node_modules', 'src', 'styles']
    }
  }
};

