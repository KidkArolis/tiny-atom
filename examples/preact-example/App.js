const Preact = require('preact') // eslint-disable-line
const { Consumer } = require('tiny-atom/preact')
require('./App.css')

const map = ({ todo, hint }) => {
  return {
    todo,
    hint
  }
}

const actions = [
  'updateItem',
  'completeItem',
  'addItem'
]

module.exports = () => (
  <Consumer map={map} actions={actions}>
    {({ todo, hint, updateItem, completeItem, addItem }) => (
      <div className='App'>
        <h1>tiny todo</h1>

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

        <div className='Hint'>
          {hint.show ? hint.text : ''}
        </div>
      </div>
    )}
  </Consumer>
)

function onSubmit (addItem, $input) {
  return function (e) {
    e.preventDefault()
    addItem('addItem')
    $input.focus()
  }
}
