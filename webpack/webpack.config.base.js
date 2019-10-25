import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Config, { environment } from 'webpack-config';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const baseDir = environment.valueOf('dir');
const env = environment.valueOf('env');
const sourceMap = (env === 'development');

export default new Config().merge({
  mode: env === 'development' ? 'development' : 'production',
  bail: true,
  output: {
    path: `${baseDir}/dist`,
    filename: '[name].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: env === 'build' ? 'styles.scss' : '[name].css',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env),
    }),
    // new BundleAnalyzerPlugin(), // un-comment to check bundle stats
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [ `${baseDir}/demo_app`,  `${baseDir}/src` ],
        use: 'babel-loader'
      },
      {
        test: /\.jsx$/,
        include: [ `${baseDir}/demo_app`, `${baseDir}/src` ],
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap, importLoaders: 1 },
          },
          'postcss-loader'
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap, importLoaders: 1 },
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: { sourceMap },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap, importLoaders: 1 },
          },
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
              sourceMap,
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'font/',
          }
        }
      },
      {
        test: /\.(png|jpg|gif|svg)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/',
          }
        }
      },
      {
        test: /\.(csv|tsv)/,
        use: {
          loader: 'csv-loader',
          options: {
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.less']
  },
  externals: {
  },
});
