const Preact = require('preact')
const createAtom = require('tiny-atom')
const createContext = require('tiny-atom/preact')
const devtools = require('tiny-atom/devtools')
const log = require('tiny-atom/log')

const actions = {
  increment: ({ get, set, dispatch }, payload) => {
    set({ count: get().count + payload })
  },

  decrement: ({ get, set, dispatch }, payload) => {
    set({ count: get().count - payload })
  },

  asyncIncrement: ({ get, set, dispatch }, payload) => {
    dispatch('asyncIncrementNested', payload)
  },

  asyncIncrementNested: ({ get, set, dispatch }, payload) => {
    dispatch('increment', payload)
    setTimeout(() => {
      set({
        count: get().count + payload,
        extra: (get().extra || 'a') + 'a'
      })
      setTimeout(() => {
        dispatch('decrement', 1)
      }, 1000)
    }, 1000)
  },

  track: ({ get, set, dispatch }, payload) => {
    // track is a side effect, no store updates
  }
}

const atom = window.atom = createAtom({ count: 0 }, actions, {
  debug: (info) => {
    log(info)
    devtools(info)
  }
})

const mapAtom = (state) => ({
  doubleCount: state.count * 2,
  count: state.count
})

const bindActions = [
  'increment',
  'decrement',
  'asyncIncrement'
]

const { Consumer, connect } = createContext(atom)

const App = () => (
  <Consumer map={mapAtom} actions={bindActions}>
    {({ count, doubleCount, asyncIncrement, increment, decrement }) => (
      <div>
        <h1>count: {count}</h1>
        <h1>double: {doubleCount}</h1>
        <Nested multiplier={5}>
          <Nested multiplier={10} />
        </Nested>
        <button onClick={() => increment(1)}>Increment</button>
        <button onClick={() => decrement(1)}>Decrement</button>
        <button onClick={() => asyncIncrement(2)}>Async increment</button>
      </div>
    )}
  </Consumer>
)

const Nested = connect()(({ multiplier, state, children }) => (
  <div>
    Nested component: { state.count * multiplier }
    {children[0]}
  </div>
))

Preact.render((
  <App />
), document.body, document.body.lastElementChild)
