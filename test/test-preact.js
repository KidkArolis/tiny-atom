const { equal } = require('assert')
const { JSDOM } = require('jsdom')
const Preact = require('preact')
const createAtom = require('..')
const { ProvideAtom, ConnectAtom } = require('../preact')

const { h } = Preact

suite('tiny-atom/preact')

test('rendering', () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  const atom = createAtom({ count: 0 }, evolve, render)

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
          h('div', { id: 'count-outer' }, count),
          h('button', { id: 'increment-outer', onClick: () => inc() }),
          h(Child, { multiplier: 10 }, [])
        ])
      )
    })
  )

  const Child = ({ multiplier }) => (
    h(ConnectAtom, {
      render: ({ state, split }) => (
        h('div', {}, [
          h('div', { id: 'count-inner' }, multiplier * state.count),
          h('button', { id: 'increment-inner', onClick: () => split('increment', 2) })
        ])
      )
    })
  )

  function render () {
    Preact.render(
      h(ProvideAtom, { atom }, [
        h(App, {})
      ])
    , root, root.lastElementChild)
  }

  render()

  equal(document.getElementById('count-outer').innerHTML, '0')
  equal(document.getElementById('count-inner').innerHTML, '0')

  atom.split('increment')
  equal(document.getElementById('count-outer').innerHTML, '1')
  equal(document.getElementById('count-inner').innerHTML, '10')

  atom.split('increment')
  equal(document.getElementById('count-outer').innerHTML, '2')
  equal(document.getElementById('count-inner').innerHTML, '20')

  document.getElementById('increment-outer').dispatchEvent(click(dom))
  equal(document.getElementById('count-outer').innerHTML, '3')
  equal(document.getElementById('count-inner').innerHTML, '30')

  document.getElementById('increment-inner').dispatchEvent(click(dom))
  equal(document.getElementById('count-outer').innerHTML, '5')
  equal(document.getElementById('count-inner').innerHTML, '50')
})

function click (dom) {
  return new dom.window.MouseEvent('click', {
    'view': dom.window,
    'bubbles': true,
    'cancelable': true
  })
}
