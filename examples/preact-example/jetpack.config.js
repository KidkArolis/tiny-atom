const path = require('path')

module.exports = {
  jsx: 'Preact.h',
  webpack: config => {
    config.resolve = {
      alias: {
        'tiny-atom': path.join(__dirname, '..', '..', 'src')
      }
    }
  }
}
