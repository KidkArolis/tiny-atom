// the actual tiny-atom
export { createAtom } from '../../core'

// provider component and the hooks for interfacing with the global store
export { Provider, AtomContext, createContext } from './context'
export { useSelector, useActions, useDispatch, useAtomContext } from './hooks'

// inline component local store
export { useAtom } from './useAtom'

// kinda legacyish
export { Consumer, createConsumer } from './Consumer'
export { connect, createConnect } from './connect'

// internals
export { raf } from './raf'
export { differs } from './differs'
