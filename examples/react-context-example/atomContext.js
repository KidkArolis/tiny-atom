const createContext = require('tiny-atom/react/context')
const createAtom = require('tiny-atom')
const debug = require('tiny-atom/log')
const actions = require('./actions')

const atom = window.atom = createAtom({ count: 0 }, actions, { debug })
const AtomContext = createContext(atom)

module.exports = AtomContext
