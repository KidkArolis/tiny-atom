const React = require('react')
const { Consumer, connect } = require('tiny-atom/react')
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

const Hint = connect(state => ({ hint: state.hint }))(function Hint (props) {
  return (
    <div className='Hint'>
      {props.hint.show ? props.hint.text : ''}
    </div>
  )
})

const App = () => (
  <Consumer displayName='App' map={map} actions={actions}>
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

        <Hint />
      </div>
    )}
  </Consumer>
)

module.exports = App

function onSubmit (addItem, $input) {
  return function (e) {
    e.preventDefault()
    addItem('addItem')
    $input.focus()
  }
}
