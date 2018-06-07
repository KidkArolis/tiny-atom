const Preact = require('preact')
const createAtom = require('tiny-atom')
const createContext = require('tiny-atom/preact')
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
        count: get().count + payload
      })
    }, 1000)
  },

  random: ({ set }) => {
    set({ rnd: Math.random() })
  },

  track: ({ get, set, dispatch }, payload) => {
    // track is a side effect, no store updates
  }
}

const atom = window.atom = createAtom({ count: 0 }, actions, {
  debug: log()
})

const mapAtom = (state) => ({
  doubleCount: state.count * 2,
  count: state.count,
  rnd: state.rnd
})

const bindActions = [
  'increment',
  'decrement',
  'asyncIncrement',
  'random'
]

const { Provider, Consumer, connect } = createContext()

const atom2 = createAtom({ count: 2000 }, actions)

const App = () => (
  <Provider atom={Math.random() > 0.5 ? atom : atom2}>
    <Consumer map={mapAtom} actions={bindActions}>
      {({ count, rnd, doubleCount, asyncIncrement, increment, decrement, random }) => {
        return (
          <div>
            <h1>count: {count}</h1>
            <h1>double: {doubleCount}</h1>
            <h1>rnd: {rnd}</h1>
            <Count multiplier={5} />
            <Consumer map={({ rnd }) => ({ rnd })}>
              {({ rnd }) => {
                return <div>Random: {rnd}</div>
              }}
            </Consumer>
            <button onClick={() => increment(1)}>Increment</button>
            <button onClick={() => decrement(1)}>Decrement</button>
            <button onClick={() => asyncIncrement(2)}>Async increment</button>
            <button onClick={() => random()}>Random</button>
          </div>
        )
      }}
    </Consumer>
  </Provider>
)

const mapCount = ({ count }) => ({ count })
const Count = connect(mapCount)(({ multiplier, count, children }) => {
  return (
    <div>
      Count component: { count * multiplier }
    </div>
  )
})

setInterval(() => {
  console.log('rendering')
  Preact.render((
    <App />
  ), document.body, document.body.lastElementChild)
}, 2000)
