const createAtom = require('.')
const createSelectorCreator = require('./selectors')

module.exports = function createBundles (initialBundles = [], options = {}) {
  const actionsToBundles = {}
  const atom = createAtom({}, {}, Object.assign({ evolve }, options))
  const createSelector = createSelectorCreator(atom.context, options.isEqual)
  const bundles = atom.bundles = {}

  // add is used to add a bundle to atom
  atom.add = function add (bundle) {
    // fuse in the state
    atom.fuse({ [bundle.name]: bundle.initialState })
    // store the bundle
    bundles[bundle.name] = bundle
    // index all the actions
    Object.keys(bundle.actions || {}).forEach(action => {
      // allow init and react in each bundle
      if ((action !== 'init' && action !== 'react') && !actionsToBundles[action]) {
        throw new Error(`Action ${selectorName} is duplicated!`)
      }
      // TODO - init/react will be overwritten
      actionsToBundles[action] = bundle.name
    })
    // create and bind the selectors
    Object.keys(bundle.selectors || {}).forEach(selectorName => {
      if (atom.context[selectorName]) {
        throw new Error(`Selector ${selectorName} is duplicated!`)
      }
      const selector = createSelector(bundle.selectors[selectorName])
      atom.context[selectorName] = () => selector(atom.get())
    })
  }

  function evolve ({ get: getRoot, set: setRoot, dispatch }, { type, payload }, context) {
    if (!actionsToBundles[type] && type === 'react') return
    if (!actionsToBundles[type]) throw new Error(`Missing action ${type}`)
    const bundleName = actionsToBundles[type]
    const bundle = bundles[bundleName]
    const action = bundle.actions[type]
    const get = () => getRoot()[bundleName]
    const set = (update) => setRoot({ [bundleName]: { ...get(), ...update } })
    return action({ get, getRoot, set, dispatch }, payload, context)
  }

  // add in all of the initial bundles
  initialBundles.forEach(atom.add)

  // reactor feature
  let prev = atom.get()
  atom.observe(() => {
    atom.dispatch('react', { prev })
    prev = atom.get()
  })

  return atom
}
