const { JSDOM } = require('jsdom')
const createAtom = require('../src')

module.exports = function app({ h, Provider, Consumer, connect, createContext }) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  const atom = createAtom({
    state: {
      count: 0,
      unrelated: 1
    },
    actions: {
      increment: ({ get, set }, payload = 1) => {
        set({ count: get().count + payload })
      },
      incrementUnrelated: ({ get, set }) => {
        set({ unrelated: get().unrelated + 1 })
      }
    }
  })

  if (createContext) {
    const context = createContext(atom)
    Provider = context.Provider
    Consumer = context.Consumer
    connect = context.connect
  }

  const App = () => {
    const map = state => ({
      count: state.count
    })

    const actions = dispatch => ({
      inc: x => dispatch('increment', x)
    })

    return (
      <Provider atom={atom}>
        <Consumer map={map} actions={actions} observe>
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

  const ChildWithRenderProp = ({ multiplier }) => {
    const map = state => ({
      count: state.count
    })
    return (
      <Consumer map={map} observe>
        {({ count, dispatch }) => (
          <div>
            <div id='count-inner'>{multiplier * count}</div>
            <button id='increment-inner' onClick={() => dispatch('increment', 2)} />
          </div>
        )}
      </Consumer>
    )
  }

  let childWithConnectRenderCount = 0

  const ChildWithConnect = connect(
    ({ count }) => ({ count }),
    null,
    { observe: true }
  )(({ multiplier, count, dispatch }) => {
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
    render: fn => fn(App),

    assert: async function(t) {
      await frame()

      t.is(document.getElementById('count-outer').innerHTML, '0')
      t.is(document.getElementById('count-inner').innerHTML, '0')
      t.is(document.getElementById('count-inner-2').innerHTML, '0')
      t.is(childWithConnectRenderCount, 1)

      atom.dispatch('increment')
      await frame()
      t.is(document.getElementById('count-outer').innerHTML, '1')
      t.is(document.getElementById('count-inner').innerHTML, '10')
      t.is(document.getElementById('count-inner-2').innerHTML, '50')
      t.is(childWithConnectRenderCount, 2)

      atom.dispatch('increment')
      await frame()
      t.is(document.getElementById('count-outer').innerHTML, '2')
      t.is(document.getElementById('count-inner').innerHTML, '20')
      t.is(document.getElementById('count-inner-2').innerHTML, '100')
      t.is(childWithConnectRenderCount, 3)

      document.getElementById('increment-outer').dispatchEvent(click(dom))
      await frame()
      t.is(document.getElementById('count-outer').innerHTML, '3')
      t.is(document.getElementById('count-inner').innerHTML, '30')
      t.is(document.getElementById('count-inner-2').innerHTML, '150')
      t.is(childWithConnectRenderCount, 4)

      atom.dispatch('incrementUnrelated')
      await frame()
      t.is(childWithConnectRenderCount, 4)
    }
  }
}

function click(dom) {
  return new dom.window.MouseEvent('click', {
    view: dom.window,
    bubbles: true,
    cancelable: true
  })
}

function frame() {
  return new Promise(resolve => setTimeout(resolve, 2 * (1000 / 60)))
}
