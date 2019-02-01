const { useState, useEffect, useContext } = require('react')
const createAtom = require('..')
const { AtomContext } = require('../react')

module.exports.useLocalAtom = function ({ state: initialState, actions, evolve }) {
  const [atom] = useState(() => createAtom(initialState, actions, { evolve: evolve || defaultEvolve }))
  const [state, setState] = useState(() => atom.get())
  const { atom: rootAtom } = useContext(AtomContext)

  useEffect(() => {
    const dispose = atom.observe(() => {
      setState(atom.get())
    })
    return dispose
  }, [actions, evolve])

  function defaultEvolve (atom, action, actions) {
    if (actions[action.type]) {
      actions[action.type]({ ...atom, root: rootAtom.get }, action.payload)
    } else {
      rootAtom.dispatch(action.type, action.payload)
    }
  }

  return { state, actions: atom.actions }
}
