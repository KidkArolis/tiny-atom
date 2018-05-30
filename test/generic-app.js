const { JSDOM } = require('jsdom')
const createAtom = require('../src')

module.exports = function app ({ h, Consumer, ConnectAtom, connect, createContext }) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  const atom = createAtom({ count: 0 }, { increment })

  function increment ({ get, set }, payload = 1) {
    set({ count: get().count + payload })
  }

  let Provider
  if (createContext) {
    const ctx = createContext(atom)
    Consumer = ctx.Consumer
    Provider = ctx.Provider
    connect = ctx.connect
  }

  const App = () => (
    h(Consumer || ConnectAtom, {
      map: (state) => ({
        count: state.count
      }),
      actions: (dispatch) => ({
        inc: x => dispatch('increment', x)
      }),
      children: ({ count, inc }) => (
        h('div', {}, [
          h('div', { id: 'count-outer', key: 'a' }, count),
          h('button', { id: 'increment-outer', key: 'b', onClick: () => inc() }),
          h(Child, { multiplier: 10, key: 'c' }),
          h(Child2, { multiplier: 50, key: 'd' }),
          h(Child3, { multiplier: 100, key: 'e' })
        ])
      )
    })
  )

  const Child = ({ multiplier }) => (
    h(Consumer || ConnectAtom, {
      children: ({ state, dispatch }) => (
        h('div', {}, [
          h('div', { id: 'count-inner', key: 'a' }, multiplier * state.count),
          h('button', { id: 'increment-inner', key: 'b', onClick: () => dispatch('increment', 2) })
        ])
      )
    })
  )

  const Child2 = ({ multiplier }) => (
    h(Consumer || ConnectAtom, {}, ({ state, dispatch }) => (
      h('div', {}, [
        h('div', { id: 'count-inner-2', key: 'a' }, multiplier * state.count),
        h('button', { id: 'increment-inner-2', key: 'b', onClick: () => dispatch('increment', 2) })
      ])
    ))
  )

  const Child3 = connect()(({ multiplier, state, dispatch }) => (
    h('div', {}, [
      h('div', { id: 'count-inner-3', key: 'a' }, multiplier * state.count),
      h('button', { id: 'increment-inner-3', key: 'b', onClick: () => dispatch('increment', 2) })
    ])
  ))

  return {
    root,
    Provider,

    render: function render (fn) {
      atom.observe(() => fn(App, atom, root))
      fn(App, atom, root)
    },

    assert: function (t) {
      t.is(document.getElementById('count-outer').innerHTML, '0')
      t.is(document.getElementById('count-inner').innerHTML, '0')
      t.is(document.getElementById('count-inner-2').innerHTML, '0')
      t.is(document.getElementById('count-inner-3').innerHTML, '0')

      atom.dispatch('increment')
      t.is(document.getElementById('count-outer').innerHTML, '1')
      t.is(document.getElementById('count-inner').innerHTML, '10')
      t.is(document.getElementById('count-inner-2').innerHTML, '50')
      t.is(document.getElementById('count-inner-3').innerHTML, '100')

      atom.dispatch('increment')
      t.is(document.getElementById('count-outer').innerHTML, '2')
      t.is(document.getElementById('count-inner').innerHTML, '20')
      t.is(document.getElementById('count-inner-2').innerHTML, '100')
      t.is(document.getElementById('count-inner-3').innerHTML, '200')

      document.getElementById('increment-outer').dispatchEvent(click(dom))
      t.is(document.getElementById('count-outer').innerHTML, '3')
      t.is(document.getElementById('count-inner').innerHTML, '30')
      t.is(document.getElementById('count-inner-2').innerHTML, '150')
      t.is(document.getElementById('count-inner-3').innerHTML, '300')
    }
  }
}

function click (dom) {
  return new dom.window.MouseEvent('click', {
    'view': dom.window,
    'bubbles': true,
    'cancelable': true
  })
}
