import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Config, { environment } from 'webpack-config';

const baseDir = environment.valueOf('dir');
const env = environment.valueOf('env');

export default new Config().merge({
  bail: true,
  output: {
    path: `${baseDir}/dist`,
    filename: '[name].js',
  },
  plugins: [
    new ExtractTextPlugin(env === 'build' ? 'styles.scss' : '[name].css'),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [ `${baseDir}/demo_app` ],
        use: 'babel-loader'
      },
      {
        test: /\.jsx$/,
        include: [ `${baseDir}/demo_app` ],
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: "css-loader"
          }, {
            loader: "sass-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "less-loader"
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'font/',
          }
        }
      },
      {
        test: /\.(png|jpg|gif)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/',
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.less']
  },
  externals: {
    jquery: '$',
    vizhub: 'VizHub',
    googleAnalytics: 'ga',
  },
});
