import nodeExternals from 'webpack-node-externals';

export default {
  target: 'node',
  externals: [nodeExternals()],
  babel: {
    presets: ['es2015', 'stage-0']
  },
  eslint: {
    fix: true,
    quiet: false,
  },
  module: {
    preLoaders: [
      { 
        test: /\.js$/,
        loader: 'eslint' 
      }
    ],
    loaders: [
      { 
        test: /\.js$/, 
        loader: 'babel' 
      },
      { 
        test: /\.css$/, 
        loader: 'null'
      },
      { 
        test: /\.scss$/, 
        loader: 'null' 
      },
      { 
        test: /\.less$/, 
        loader: 'null'
      },
      { 
        test: /\.json$/, 
        loader: 'json'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)/,
        loader: 'null'
      },
      {
        test: /\.(png|jpg|gif)/,
        loader: 'file',
        loader: 'null'
      },
    ]
  },
  progress: true
};