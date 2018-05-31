const React = require('react')
const ReactDOM = require('react-dom')
const createAtom = require('tiny-atom')
const createConnector = require('tiny-atom/react')
const log = require('tiny-atom/log')

// our atom
const atom = window.atom = createAtom({ count: 0 }, {
  increment: ({ get, set, dispatch }, payload) => {
    set({ count: get().count + payload })
  },

  decrement: ({ get, set, dispatch }, payload) => {
    set({ count: get().count - payload })
  },

  random: ({ set }) => {
    set({ rnd: Math.random() })
  }
}, { debug: log })

// our connectors
const { Consumer: AtomConsumer, connect } = createConnector(atom)

// our app
const mapAtom = (state, split) => ({
  stable: 'coin',
  count: state.count,
  rnd: state.rnd
})

const mapActions = [
  'increment',
  'decrement',
  'random'
]

const App = () => {
  return (
    <AtomConsumer id='app' map={mapAtom} actions={mapActions}>
      {({ count, rnd, increment, decrement, random }) => {
        console.log('Rendering (inside)', 'app')
        return (
          <div>
            <div>App count: {count}</div>
            <div>Rnd: {rnd}</div>
            <Count id='count' doubleCount={count * 2} />
            <AtomConsumer map={({ rnd }) => ({ rnd })}>
              {({ rnd }) => {
                console.log('Rendered rnd (inside)')
                return <div>Random: {rnd}</div>
              }}
            </AtomConsumer>
            <button onClick={() => increment(1)}>Increment</button>
            <button onClick={() => decrement(1)}>Decrement</button>
            <button onClick={() => random()}>Random</button>
          </div>
        )
      }}
    </AtomConsumer>
  )
}

let map = ({ count }) => ({ count })
const Count = connect(map)(({ count }) => {
  console.log('Rendering (inside)', 'count')
  return (
    <div>
      Current count: { count }.
    </div>
  )
})

// render the app once
ReactDOM.render((
  <App id='app' />
), document.getElementById('root'))
