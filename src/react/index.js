// the actual tiny-atom
export { createStore } from '../core'

// provider component and the hooks for interfacing with the global store
export { Provider, StoreContext, createContext } from './context'
export { useSelector, useActions, useDispatch } from './hooks'

// inline component local store
export { useStore } from './useStore'

// kinda legacyish
export { Consumer, createConsumer } from './Consumer'
export { connect, createConnect } from './connect'
