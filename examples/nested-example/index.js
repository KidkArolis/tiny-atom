const Preact = require('preact')
const { ProvideAtom } = require('tiny-atom/preact')
const App = require('./components/App')
const raf = require('./utils/raf')

const merge = require('tiny-atom/deep-merge')
const debug = require('tiny-atom/log')
const createAtom = require('./atom-simpler')

const atom = window.atom = createAtom({ merge, debug })

atom({ a: 1 }, {
  plus: (get, split) => {
    split({ a: get().a + 1 })
    split('todo.update', 'plus')
    split('todo.add')
  }
})

atom({ b: 1 }, {
  minus: (get, split) => {
    split({ a: get().a - 1 })
    split('todo.update', 'minus')
    split('todo.add')
  }
})

const actions = require('./actions')
Object.keys(actions).forEach(pack => {
  const p = actions[pack]
  atom(pack, p.state, p.actions)
})

atom.split('plus')
atom.split('plus')
atom.split('plus')
atom.split('minus')

const render = raf(function render () {
  Preact.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.body, document.body.lastElementChild)
})

atom.observe(render)
render()