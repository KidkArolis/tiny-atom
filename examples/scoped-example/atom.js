const createConnector = require('tiny-atom/preact')
const log = require('tiny-atom/log')
const createAtom = require('./scoped')
const atom = window.atom = createAtom({ debug: log() })
const { Consumer } = createConnector(atom)
module.exports = { atom, Consumer }