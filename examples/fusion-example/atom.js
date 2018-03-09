const createAtom = require('tiny-atom/fusion')
const log = require('tiny-atom/log')
const merge = require('tiny-atom/deep-merge')
const actions = require('./actions')

module.exports = window.atom = createAtom(actions, { debug: log, merge })
// module.exports = window.atom = require('./atom-custom')(actions, { debug: log, merge })
