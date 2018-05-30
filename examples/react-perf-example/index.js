const React = require('react')
const ReactDOM = require('react-dom')
const createAtom = require('tiny-atom')
const createContext = require('tiny-atom/react')
const debug = require('tiny-atom/log')
const actions = require('./actions')

const atom = window.atom = createAtom({ count: 0, stable: 'stable' }, actions, { debug })
const { Provider: AtomProvider, Consumer: AtomConsumer, connect } = createContext(atom)

const mapAtom = (state, split) => ({
  doubleCount: state.count * 2,
  count: state.count
})

// const mapActions = (dispatch) => ({
//   dispatch: dispatch,
//   inc: () => dispatch('increment', 1),
//   dec: () => dispatch('decrement', 1),
//   asyncIncrement: x => () => dispatch('asyncIncrement', x)
// })

const mapActions = [
  'increment',
  'decrement',
  'asyncIncrement',
  'rnd',
  'track'
]

const App = () => (
  <AtomConsumer map={mapAtom} actions={mapActions}>
    {({ count, doubleCount, track, asyncIncrement, increment, decrement, rnd }) => (
      <div>
        <h1>count: {count}</h1>
        <h1>double: {doubleCount}</h1>
        <Nested multiplier={5}>
          <Nested multiplier={10} />
        </Nested>
        <button onClick={() => increment(1)}>Increment</button>
        <button onClick={() => decrement(1)}>Decrement</button>
        <button onClick={() => asyncIncrement(2)}>Async increment</button>
        <button onClick={() => track()}>Track</button>
        <button onClick={rnd}>Random</button>
        <Stable />
      </div>
    )}
  </AtomConsumer>
)

const Nested = ({ multiplier, children }) => (
  <AtomConsumer>
    {({ state }) => (
      <div>
        Nested component: { state.count * multiplier }
        {children[0]}
      </div>
    )}
  </AtomConsumer>
)

// let calls = 0
// let renders = 0
// const Stable = ({ multiplier, children }) => {
//   calls++
//   console.log('CALLS+RENDERS', calls, renders)
//   return (
//     <AtomConsumer map={({ stable }) => ({ stable })}>
//       {({ stable }) => {
//         renders++
//         console.log('CALLS+RENDERS INNER', calls, renders)
//         return (
//           <div>
//             Stable component: { stable }
//           </div>
//         )
//       }}
//     </AtomConsumer>
//   )
// }

let map = ({ stable }) => ({ stable })
let mapStableActions = ['increment']
const Stable = connect(map, mapStableActions)(({ stable, increment }) => {
  return (
    <div onClick={() => increment(10)}>
      Stable component: { stable }
    </div>
  )
})

ReactDOM.render((
  <AtomProvider>
    <App />
  </AtomProvider>
), document.getElementById('root'))
