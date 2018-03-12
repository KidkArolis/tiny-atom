const Preact = require('preact')
const { ProvideAtom } = require('tiny-atom/preact')
const raf = require('tiny-atom/raf')
const debug = require('tiny-atom/log')
const App = require('./components/App')
const createAtom = require('./fractalAtom')

const atom = window.atom = createAtom({ debug })

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

const deep = atom('deeply')('nested')('atom')
deep.split({ nested: 123 })

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
