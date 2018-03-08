const { JSDOM } = require('jsdom')
const createAtom = require('../src')

module.exports = function app ({ h, ProvideAtom, ConnectAtom, connect }) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  const atom = createAtom({ count: 0 }, evolve)

  function evolve (get, split, { type, payload }) {
    if (type === 'increment') {
      split({ count: get().count + (payload || 1) })
    }
  }

  const App = () => (
    h(ConnectAtom, {
      map: (state, split) => ({
        count: state.count,
        inc: x => split('increment', x)
      }),
      render: ({ count, inc }) => (
        h('div', {}, [
          h('div', { id: 'count-outer', key: 'a' }, count),
          h('button', { id: 'increment-outer', key: 'b', onClick: () => inc() }),
          h(Child, { multiplier: 10, key: 'c' }, []),
          h(Child2, { multiplier: 50, key: 'd' }, []),
          h(Child3, { multiplier: 100, key: 'e' }, [])
        ])
      )
    })
  )

  const Child = ({ multiplier }) => (
    h(ConnectAtom, {
      render: ({ state, split }) => (
        h('div', {}, [
          h('div', { id: 'count-inner', key: 'a' }, multiplier * state.count),
          h('button', { id: 'increment-inner', key: 'b', onClick: () => split('increment', 2) })
        ])
      )
    })
  )

  const Child2 = ({ multiplier }) => (
    h(ConnectAtom, {}, ({ state, split }) => (
      h('div', {}, [
        h('div', { id: 'count-inner-2', key: 'a' }, multiplier * state.count),
        h('button', { id: 'increment-inner-2', key: 'b', onClick: () => split('increment', 2) })
      ])
    ))
  )

  const Child3 = connect()(({ multiplier, state, split }) => (
    h('div', {}, [
      h('div', { id: 'count-inner-3', key: 'a' }, multiplier * state.count),
      h('button', { id: 'increment-inner-3', key: 'b', onClick: () => split('increment', 2) })
    ])
  ))

  return {
    render: function render (fn) {
      atom.observe(() => fn(App, atom, root))
      fn(App, atom, root)
    },

    assert: function (t) {
      t.is(document.getElementById('count-outer').innerHTML, '0')
      t.is(document.getElementById('count-inner').innerHTML, '0')
      t.is(document.getElementById('count-inner-2').innerHTML, '0')
      t.is(document.getElementById('count-inner-3').innerHTML, '0')

      atom.split('increment')
      t.is(document.getElementById('count-outer').innerHTML, '1')
      t.is(document.getElementById('count-inner').innerHTML, '10')
      t.is(document.getElementById('count-inner-2').innerHTML, '50')
      t.is(document.getElementById('count-inner-3').innerHTML, '100')

      atom.split('increment')
      t.is(document.getElementById('count-outer').innerHTML, '2')
      t.is(document.getElementById('count-inner').innerHTML, '20')
      t.is(document.getElementById('count-inner-2').innerHTML, '100')
      t.is(document.getElementById('count-inner-3').innerHTML, '200')

      document.getElementById('increment-outer').dispatchEvent(click(dom))
      t.is(document.getElementById('count-outer').innerHTML, '3')
      t.is(document.getElementById('count-inner').innerHTML, '30')
      t.is(document.getElementById('count-inner-2').innerHTML, '150')
      t.is(document.getElementById('count-inner-3').innerHTML, '300')

      document.getElementById('increment-inner').dispatchEvent(click(dom))
      t.is(document.getElementById('count-outer').innerHTML, '5')
      t.is(document.getElementById('count-inner').innerHTML, '50')
      t.is(document.getElementById('count-inner-2').innerHTML, '250')
      t.is(document.getElementById('count-inner-3').innerHTML, '500')
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
