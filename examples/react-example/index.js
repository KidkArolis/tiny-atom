const React = require('react')
const ReactDOM = require('react-dom')
const createAtom = require('tiny-atom')
const createConnector = require('tiny-atom/react')
const devtools = require('tiny-atom/devtools')
const log = require('tiny-atom/log')

const atom = window.atom = createAtom({ count: 0, list: [1] }, actions(), {
  debug: [log(), devtools()]
})

const { Provider, Consumer } = createConnector()

function actions () {
  return {
    increment: ({ get, set }, payload) => {
      set({ count: get().count + payload })
    },

    decrement: ({ get, set }, payload) => {
      set({ count: get().count - payload })
      const l = Math.round(Math.random() * 10)
      set({ list: Array.from({length: l}, () => Math.floor(Math.random() * l)) })
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

    track: (get, split, payload) => {
      // track is a side effect, no store updates
    }
  }
}

const map = (state) => ({
  doubleCount: state.count * 2,
  count: state.count
})

const mapActions = [
  'increment',
  'decrement',
  'asyncIncrement'
]

const App = () => (
  <Provider atom={atom}>
    <Consumer map={map} actions={mapActions}>
      {({ count, doubleCount, asyncIncrement, increment, decrement }) => (
        <div>
          <h2>count: {count}</h2>
          <h2>double: {doubleCount}</h2>
          <Nested multiplier={5}>
            <Nested multiplier={10} />
          </Nested>
          <button onClick={() => increment(1)}>Increment</button>
          <button onClick={() => decrement(1)}>Decrement</button>
          <button onClick={() => asyncIncrement(2)}>Async increment</button>
        </div>
      )}
    </Consumer>
  </Provider>
)

const Nested = ({ multiplier, children }) => (
  <Consumer map={state => ({ count: state.count })}>
    {({ count }) => (
      <div style={{ padding: '30px' }}>
        Nested component: { count * multiplier }
        {children}
      </div>
    )}
  </Consumer>
)

ReactDOM.render((
  <App />
), document.getElementById('root'))
