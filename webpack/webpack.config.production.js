import webpack from 'webpack';
import {
  Config,
  environment,
} from 'webpack-config';

import MinifyPlugin from 'babel-minify-webpack-plugin';

export default new Config().extend('./webpack/webpack.config.base.js').merge({
  entry: {
    bundle: ['./demo_app/app.js'],
  },
  filename: __filename,
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new MinifyPlugin()
  ]
});
