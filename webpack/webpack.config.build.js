import { environment } from 'webpack-config';

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
});
