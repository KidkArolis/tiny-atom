const Preact = require('preact')
const App = require('./App')
const actions = require('./actions')
const { atom } = require('./atom')

atom({ a: 1 }, {
  plus: ({ get, set, dispatch }) => {
    set({ a: get().a + 1 })
    dispatch('todo.update', 'plus')
    dispatch('todo.add')
  }
})

atom({ b: 1 }, {
  minus: ({ get, set, dispatch }) => {
    set({ a: get().a - 1 })
    dispatch('todo.update', 'minus')
    dispatch('todo.add')
  }
})

Object.keys(actions).forEach(pack => {
  const p = actions[pack]
  atom(pack, p.state, p.actions)
})

const deep = atom('deeply')('nested')('atom')
deep.set({ nested: 123 })

atom.dispatch('plus')
atom.dispatch('plus')
atom.dispatch('minus')

Preact.render((
  <App />
), document.body, document.body.lastElementChild)
