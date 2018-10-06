module.exports = {
  plugins: [
    require('autoprefixer')({ grid: true, browsers: ['last 2 versions', 'ie 10-11', 'Firefox > 20'] })
  ]
}
