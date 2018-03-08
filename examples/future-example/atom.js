const createAtom = require('tiny-atom/future')
const log = require('tiny-atom/log')
const merge = require('tiny-atom/deep-merge')
const actions = require('./actions')

module.exports = window.atom = createAtom(actions, { debug: log, merge })
