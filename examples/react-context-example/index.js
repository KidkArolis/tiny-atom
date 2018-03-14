const React = require('react')
const ReactDOM = require('react-dom')
const createAtom = require('tiny-atom')
const createContext = require('tiny-atom/react/context')
const debug = require('tiny-atom/log')
const actions = require('./actions')

const atom = window.atom = createAtom({ count: 0 }, actions, { debug })
const { Provider, Consumer } = createContext(atom)

const mapAtom = (state, split) => ({
  doubleCount: state.count * 2,
  count: state.count,
  split: split,
  inc: () => split('increment', 1),
  dec: () => split('decrement', 1),
  asyncIncrement: x => () => split('asyncIncrement', x)
})

const App = () => (
  <Consumer map={mapAtom}>
    {({ count, doubleCount, split, asyncIncrement, inc, dec }) => (
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
    )}
  </Consumer>
)

const Nested = ({ multiplier, children }) => (
  <Consumer>
    {({ state }) => (
      <div>
        Nested component: { state.count * multiplier }
        {children[0]}
      </div>
    )}
  </Consumer>
)

ReactDOM.render((
  <Provider>
    <App />
  </Provider>
), document.getElementById('root'))
