const path = require('path')

module.exports = {
  jsx: 'React.createElement',
  webpack: (config) => {
    config.devtool = 'source-map'
    config.resolve = {
      alias: {
        'tiny-atom': path.join(__dirname, '..', '..', 'src')
      }
    }
  }
}
