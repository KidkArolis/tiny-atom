const path = require('path')

module.exports = {
  webpack: (config) => {
    config.resolve = {
      alias: {
        'tiny-atom': path.join(__dirname, '..', '..', 'src'),
      },
    }
  },
}
