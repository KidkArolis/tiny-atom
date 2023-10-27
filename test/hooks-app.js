import { createRoot } from 'react-dom/client'
import { createAtom, Provider } from '../src'

/** @jsx h */

module.exports = function renderHooksApp({ h, root, useSelector, useActions, useDispatch }) {
  const stats = {}

  const container = createRoot(root)

  const atom = createAtom({
    state: {
      count: 0,
      unrelated: 1,
      user: { loggedIn: true },
    },
    actions: {
      increment: ({ get, set }, payload = 1) => {
        set({ count: get().count + payload })
      },
      decrement: ({ get, set }, payload = 1) => {
        set({ count: get().count - payload })
      },
      incrementUnrelated: ({ get, set }) => {
        set({ unrelated: get().unrelated + 1 })
      },
      replaceUser({ get, set }, user) {
        set({ user })
      },
    },
  })

  stats.appRenderCount = 0
  const App = () => {
    stats.appRenderCount++
    const count = useSelector((state) => state.count, { observe: true })
    const { increment } = useActions()

    return (
      <div>
        <div id='count-outer'>{count}</div>
        <button id='increment-outer' onClick={() => increment()} />
        <Child multiplier={10} />
      </div>
    )
  }

  stats.childRenderCount = 0
  const Child = ({ multiplier }) => {
    stats.childRenderCount++
    const count = useSelector((state) => state.count, { observe: true })
    const user = useSelector((state) => state.user, { observe: true })
    const dispatch = useDispatch()
    return (
      <div>
        <div id='count-inner'>{count * multiplier}</div>
        <div>Logged in: {user.loggedIn}</div>
        <button id='increment-inner' onClick={() => dispatch('increment', 2)} />
      </div>
    )
  }

  container.render(
    <Provider atom={atom}>
      <App />
    </Provider>,
  )

  return { atom, stats }
}
