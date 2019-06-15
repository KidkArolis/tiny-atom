/**
 * A component local store.
 * A great compliment to the global store.
 */

import { useState, useEffect } from 'react'
import { createStore } from '../core'

export function useStore(setup, deps) {
  const [atom] = useState(() => {
    const { state, ...actions } = setup()
    return createStore(state, actions)
  })
  const [state, setState] = useState(() => atom.get())

  useEffect(() => {
    const unobserve = atom.observe(() => {
      setState(atom.get())
    })
    return unobserve
  }, [atom])

  // todo, we could allow dynamically swapping actions
  // based on a deps array, for that we'd need to store
  // actions in useState, etc.

  return [state, atom.actions]
}
