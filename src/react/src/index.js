// the actual tiny-atom
export { createAtom } from '../../core/src/index.js'

// provider component and the hooks for interfacing with the global store
export { Provider, AtomContext, createContext } from './context.js'
export { useSelector, useActions, useDispatch, useAtom, createHooks } from './hooks.js'

// kinda legacyish
export { Consumer, createConsumer } from './Consumer.js'
export { connect, createConnect } from './connect.js'

// internals
export { differs } from './differs.js'
