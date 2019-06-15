import React, { useMemo } from 'react'

export function createContext() {
  const StoreContext = React.createContext()

  function Provider({ atom, children }) {
    const value = useMemo(() => ({ atom }), [atom])
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  }

  return { StoreContext, Provider }
}

const context = createContext()

export const StoreContext = context.StoreContext
export const Provider = context.Provider
