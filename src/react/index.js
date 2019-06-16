// the actual tiny-atom
export { createStore } from '../core'

// provider component and the hooks for interfacing with the global store
export { Provider, AtomContext, createContext } from './context'
export { useSelector, useActions, useDispatch, useAtomInstance } from './hooks'

// inline component local store
export { useAtom } from './useAtom'

// kinda legacyish
export { Consumer, createConsumer } from './Consumer'
export { connect, createConnect } from './connect'
