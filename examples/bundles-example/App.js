import { selectTodoCount } from './todo'
import React from 'react'
import { Consumer, connect } from 'tiny-atom/react'
import './App.css'

const map = (state, props) => {
  const { todo, hint } = state
  return {
    todo,
    hint,
    todoCount: selectTodoCount(state)
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
    {({ todo, hint, updateItem, completeItem, addItem, todoCount }) => (
      <div className='App'>
        <h1>tiny todo - {todoCount}</h1>

      
        {todo.items.map((item, i) => (
          <div className='Todo' key={i} onClick={() => completeItem(i)}>
            <span className='Todo-done'>☐</span>
            {item}
          </div>
        ))}

        {todo.items.length === 0 &&
          <div className='Todo-empty'>Take a break!</div>
        }
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

export default App
