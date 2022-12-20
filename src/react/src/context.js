import React, { useMemo } from 'react'

export function createContext() {
  const AtomContext = React.createContext()

  function Provider({ atom, children }) {
    const value = useMemo(() => ({ atom }), [atom])
    return <AtomContext.Provider value={value}>{children}</AtomContext.Provider>
  }

  return { AtomContext, Provider }
}

const context = createContext()

export const AtomContext = context.AtomContext
export const Provider = context.Provider
