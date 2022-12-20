const { createAtom } = require('tiny-atom')
const { createLog } = require('tiny-atom/log')

const actions = {
  increment: ({ get, set }, x) => {
    set({ count: get().count + x })
  },

  asyncIncrement: ({ get, set, dispatch }, x) => {
    set({ loading: true })
    setTimeout(() => {
      dispatch('increment', x)
      set({ loading: false })
    }, 1000)
  },
}

const atom = createAtom({ state: { count: 0 }, actions, debug: createLog() })

atom.observe(function render(atom) {
  document.body.innerHTML = `Count ${atom.get().count}`
  if (atom.get().loading) {
    document.body.innerHTML += ' (Loading...)'
  }
})

atom.dispatch('increment', 5)
// -> { count: 5 }

atom.dispatch('asyncIncrement', 3)
// -> { count: 5, loading: true }

atom.dispatch('increment', 2)
// -> { count: 7, loading: true }
// -> 1 second later...
// -> { count: 10, loading: false }
