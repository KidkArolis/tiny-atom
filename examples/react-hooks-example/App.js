const React = require('react')
const { useAtom, useActions, useDispatchEffect } = require('tiny-atom/react/hooks')
const { useLocalAtom } = require('tiny-atom/react/local')
require('./App.css')

const hintAtom = () => {
  let interval
  return {
    state: {
      time: new Date()
    },
    actions: {
      logShiz ({ get, root, dispatch }) {
        console.log('local time', get())
        console.log('root item count', root().todo.items.length)
        dispatch("logMoreShiz")
        dispatch("updateItem", 'aha! it works!')
      },
      logMoreShiz () {
        console.log('more shiz!')
      },
      startTicking ({ get, set }) {
        console.log('started')
        interval = setInterval(() => {
          set({ time: new Date() })
        }, 1000)
      },
      stopTicking () {
        console.log('stopped')
        clearInterval(interval)
      }
    }
  }
}

const Hint = function Hint (props) {
  const { show, text } = useAtom(state => state.hint)
  const count = useAtom(state => state.todo.items.length)

  const { state, actions } = useLocalAtom(hintAtom())
  useDispatchEffect(actions.startTicking, actions.stopTicking)

  return (
    <div className='Hint'>
      Count {count} {show ? text : ''}.
      <br />
      <div onClick={actions.logShiz}>And time {state.time.toISOString()}</div>
    </div>
  )
}

const Modal = () => {
  const count = useAtom(state => state.count)
  return <div style={{position: 'absolute', top: '10px', left: '10px', background: 'wheat'}}>{count}</div>
}

const App = () => {
  const todo = useAtom(state => state.todo)
  const count = useAtom(state => state.count)
  const { updateItem, completeItem, addItem } = useActions()

  return (
    <div className='App'>
      <h1>tiny todo {count}</h1>

      {count > 5 && <Modal />}

      <form onSubmit={onSubmit(addItem, this.$input)}>
        <input
          className='Todo-input'
          type='text'
          ref={el => { this.$input = el }}
          onChange={(e) => updateItem(e.target.value)}
          value={todo.input}
        />
      </form>

      {todo.items.map((item, i) => (
        <div className='Todo' key={i} onClick={() => completeItem(i)}>
          <span className='Todo-done'>☐</span>
          {item}
        </div>
      ))}

      {todo.items.length === 0 &&
        <div className='Todo-empty'>Take a break!</div>
      }

      <Hint />
    </div>
  )
}

module.exports = App

function onSubmit (addItem, $input) {
  return function (e) {
    e.preventDefault()
    addItem('addItem')
    $input.focus()
  }
}
