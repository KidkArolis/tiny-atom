/**
 * A component local store.
 * A great complement to the global store.
 */

import { useState, useMemo, useEffect } from 'react'
import { createStore } from '../core'

export function useAtom(setup, deps) {
  const config = useMemo(() => {
    if (typeof setup === 'function') {
      return setup()
    } else {
      return null
    }
  }, deps || [])

  const [atom] = useState(() => (config ? createStore(config) : setup))
  const [actions, setActions] = useState(() => atom.actions)
  const [state, setState] = useState(() => atom.get())

  useEffect(() => {
    let didUnmount = false
    const unobserve = atom.observe(() => {
      if (!didUnmount) {
        setState(atom.get())
      }
    })
    return () => {
      didUnmount = true
      unobserve()
    }
  }, [atom])

  useEffect(() => {
    atom.fuse({ actions: config.actions })
    setActions(atom.actions)
  }, [config.actions])

  // todo, we could allow dynamically swapping actions
  // based on a deps array, for that we'd need to store
  // actions in useState, etc.

  return [state, actions, atom]
}
