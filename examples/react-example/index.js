const React = require('react')
const ReactDOM = require('react-dom')
const createAtom = require('tiny-atom')
const { ProvideAtom, ConnectAtom } = require('tiny-atom/react')
const devtools = require('tiny-atom/devtools')
const log = require('tiny-atom/log')

const atom = window.atom = createAtom({ count: 0 }, evolve, render, {
  debug: (info) => {
    log(info)
    devtools(info)
  }
})

const actions = {
  increment: (get, split, payload) => {
    split({ count: get().count + payload })
  },

  decrement: (get, split, payload) => {
    split({ count: get().count - payload })
  },

  asyncIncrement: (get, split, payload) => {
    split('asyncIncrementNested', payload)
  },

  asyncIncrementNested: (get, split, payload) => {
    split('increment', payload)
    setTimeout(() => {
      split({
        count: get().count + payload,
        extra: (get().extra || 'a') + 'a'
      })
      setTimeout(() => {
        split('decrement', 1)
      }, 1000)
    }, 1000)
  },

  track: (get, split, payload) => {
    // track is a side effect, no store updates
  }
}

function evolve (get, split, action) {
  actions[action.type](get, split, action.payload)
}

const mapAtom = (state, split) => ({
  doubleCount: state.count * 2,
  count: state.count,
  split: split,
  inc: () => split('increment', 1),
  dec: () => split('decrement', 1),
  asyncIncrement: x => () => split('asyncIncrement', x)
})

const App = () => (
  <ConnectAtom map={mapAtom} render={({ count, doubleCount, split, asyncIncrement, inc, dec }) => (
    <div>
      <h1>count: {count}</h1>
      <h1>double: {doubleCount}</h1>
      <Nested multiplier={5}>
        <Nested multiplier={10} />
      </Nested>
      <button onClick={inc}>Increment</button>
      <button onClick={dec}>Decrement</button>
      <button onClick={asyncIncrement(2)}>Async increment</button>
      <button onClick={() => split('track')}>Track</button>
      <button onClick={() => split({ rnd: Math.random() })}>Random</button>
    </div>
  )} />
)

const Nested = ({ multiplier, children }) => (
  <ConnectAtom map={state => ({ count: state.count })} render={({ count }) => (
    <div>
      Nested component: { count * multiplier }
      {children[0]}
    </div>
  )} />
)

function render (atom) {
  ReactDOM.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.getElementById('root'))
}

render(atom)
