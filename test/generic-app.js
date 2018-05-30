const { JSDOM } = require('jsdom')
const createAtom = require('../src')

module.exports = function app ({ h, createContext }) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  const atom = createAtom({ count: 0, unrelated: 1 }, {
    increment: ({ get, set }, payload = 1) => {
      set({ count: get().count + payload })
    },
    incrementUnrelated: ({ get, set }) => {
      set({ unrelated: get().unrelated + 1 })
    }
  })

  const { Provider, Consumer, connect } = createContext(atom)

  const App = () => {
    const map = (state) => ({
      count: state.count
    })

    const actions = (dispatch) => ({
      inc: x => dispatch('increment', x)
    })

    return (
      <Provider>
        <Consumer map={map} actions={actions}>
          {({ count, inc }) => (
            <div>
              <div id='count-outer'>{count}</div>
              <button id='increment-outer' onClick={() => inc()} />
              <ChildWithRenderProp multiplier={10} />
              <ChildWithConnect id='connected' multiplier={50} />
            </div>
          )}
        </Consumer>
      </Provider>
    )
  }

  const ChildWithRenderProp = ({ multiplier }) => (
    <Consumer>
      {({ state, dispatch }) => (
        <div>
          <div id='count-inner'>{multiplier * state.count}</div>
          <button id='increment-inner' onClick={() => dispatch('increment', 2)} />
        </div>
      )}
    </Consumer>
  )

  let childWithConnectRenderCount = 0

  const ChildWithConnect = connect(({ count }) => ({ count }))(({ multiplier, count, dispatch }) => {
    childWithConnectRenderCount++
    return (
      <div>
        <div id='count-inner-2'>{multiplier * count}</div>
        <button id='increment-inner-2' onClick={() => dispatch('increment', 2)} />
      </div>
    )
  })

  return {
    root,
    render: (fn) => fn(App),

    assert: async function (t) {
      t.is(childWithConnectRenderCount, 1)

      t.is(document.getElementById('count-outer').innerHTML, '0')
      t.is(document.getElementById('count-inner').innerHTML, '0')
      t.is(document.getElementById('count-inner-2').innerHTML, '0')

      atom.dispatch('increment')
      await Promise.resolve()
      t.is(document.getElementById('count-outer').innerHTML, '1')
      t.is(document.getElementById('count-inner').innerHTML, '10')
      t.is(document.getElementById('count-inner-2').innerHTML, '50')
      t.is(childWithConnectRenderCount, 2)

      atom.dispatch('increment')
      await Promise.resolve()
      t.is(document.getElementById('count-outer').innerHTML, '2')
      t.is(document.getElementById('count-inner').innerHTML, '20')
      t.is(document.getElementById('count-inner-2').innerHTML, '100')
      t.is(childWithConnectRenderCount, 3)

      document.getElementById('increment-outer').dispatchEvent(click(dom))
      await Promise.resolve()
      t.is(document.getElementById('count-outer').innerHTML, '3')
      t.is(document.getElementById('count-inner').innerHTML, '30')
      t.is(document.getElementById('count-inner-2').innerHTML, '150')
      t.is(childWithConnectRenderCount, 4)

      atom.dispatch('incrementUnrelated')
      await Promise.resolve()
      t.is(childWithConnectRenderCount, 4)
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
