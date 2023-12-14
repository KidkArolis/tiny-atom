// the actual tiny-atom
export { createAtom } from '../../core'

// provider component and the hooks for interfacing with the global store
export { Provider, AtomContext, createContext } from './context'
export { useSelector, useActions, useDispatch, useAtom, createHooks } from './hooks'

// kinda legacyish
export { Consumer, createConsumer } from './Consumer'
export { connect, createConnect } from './connect'

// internals
export { differs } from './differs'
