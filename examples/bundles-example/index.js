const React = require('react')
const ReactDOM = require('react-dom')
const createAtom = require('tiny-atom')
const bundles = require('tiny-atom/bundles')
const { Provider } = require('tiny-atom/react')
const log = require('tiny-atom/log')
const App = require('./App').default
const todo = require('./todo')
const hint = require('./hint')

const atom = window.atom = createAtom({ debug: log(), ...bundles() })

atom.fuse(todo)
atom.fuse(hint)

ReactDOM.render((
  <Provider atom={atom}>
    <App />
  </Provider>
), document.querySelector('#root'))
