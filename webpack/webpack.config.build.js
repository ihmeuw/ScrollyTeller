
import {
  Config,
  ConfigEnvironment
} from 'webpack-config';

export default new Config().extend('./webpack/webpack.config.base.js').merge({
  entry: {
    lib: ['./src/ScrollyTeller/ScrollyTeller.js'],
    css: ['./src/ScrollyTeller/cssImport.js'],
  },
  output: {
    library: 'ScrollyTeller',
    libraryTarget: 'umd',
  },
});
