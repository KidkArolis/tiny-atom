const createAtom = require('tiny-atom')
const log = require('tiny-atom/log')
const merge = require('./utils/merge')
const actions = require('./actions')

const atom = window.atom = createAtom(initialState(actions), evolve, { debug: log, merge })

atom.split = assignActions(atom.split, actions)

function initialState (actions) {
  return mapObj(actions, pack => pack.state)
}

function evolve (get, split, action) {
  const [pack, type] = action.type.split('.')

  if (!actions[pack]) throw new Error(`No such action pack '${pack}'`)
  if (!actions[pack].actions) throw new Error(`Action pack '${pack}' malformed, missing actions object`)
  if (!actions[pack].actions[type]) throw new Error(`No such action '${pack}.${type}'`)

  get = namespacedGet(pack, get)
  split = assignActions(namespacedSplit(pack, split))

  actions[pack].actions[type](get, split, action.payload)
}

function namespacedGet (pack, get) {
  return ({ root } = {}) => root
    ? get()
    : get()[pack]
}

function namespacedSplit (pack, split) {
  return (...args) => typeof args[0] === 'string'
    ? split(...args)
    : split({ [pack]: args[0] })
}

function assignActions (split) {
  return Object.assign(split, createActionPacks(split, actions))
}

function createActionPacks (split, actions) {
  return mapObj(actions, (pack, namespace) =>
    mapObj(pack.actions, (impl, action) => payload => split(`${namespace}.${action}`, payload))
  )
}

function mapObj (obj, fn) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = fn(obj[key], key)
    return acc
  }, {})
}

module.exports = atom
