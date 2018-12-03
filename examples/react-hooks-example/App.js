const React = require('react')
const { useAtom, useActions } = require('tiny-atom/react/hooks')
require('./App.css')

const Hint = function Hint (props) {
  const { show, text } = useAtom(state => state.hint)
  return (
    <div className='Hint'>
      {show ? text : ''}
    </div>
  )
}

const App = () => {
  const todo = useAtom(state => state.todo)
  const count = useAtom(state => state.count)
  const { updateItem, completeItem, addItem } = useActions()

  return (
    <div className='App'>
      <h1>tiny todo {count}</h1>

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
