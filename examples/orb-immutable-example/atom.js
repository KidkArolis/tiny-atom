const createAtom = require('tiny-atom/orb')
const log = require('tiny-atom/log')
const actions = require('./actions')
const { Map } = require('immutable')

const get = (state, key) => state.get(key)
const merge = (state, update) => state.merge(update)
module.exports = window.atom = createAtom(actions, { debug: log, merge, get }, Map({}))
