import WebpackNotifierPlugin from 'webpack-notifier';
import BrowserSyncPlugin from 'browser-sync-webpack-plugin';
import { environment } from 'webpack-config';
const baseDir = environment.valueOf('dir');

import {
  Config,
  ConfigEnvironment
} from 'webpack-config';

export default new Config().extend('./webpack/webpack.config.base.js').merge({
  devtool: 'cheap-module-source-map',
  entry: {
    lib: ['babel-polyfill', './app/ScrollyTeller/ScrollyTeller.js'],
  },
  output: {
    library: 'ScrollyTeller',
    libraryTarget: 'umd',
  },
  resolve: {
    root: [
      path.resolve('../node_modules')
    ]
  }
});
