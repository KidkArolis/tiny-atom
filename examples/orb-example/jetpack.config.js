const path = require('path')

module.exports = {
  webpack: (config) => {
    config.devtool = 'cheap-inline-source-map'
    config.resolve = {
      alias: {
        'tiny-atom': path.join(__dirname, '..', '..', 'src')
      }
    }
  }
}
