import React, { useRef } from 'react'
import { useSelector, useActions } from 'tiny-atom'
import './App.css'

function Hint() {
  const { show, text } = useSelector((state) => state.hint)
  const count = useSelector((state) => state.count)
  console.log('Rendering Hint')
  return (
    <div className='Hint'>
      Count {count} {show ? text : ''}
    </div>
  )
}

const Modal = () => {
  const count = useSelector((state) => state.count)
  return <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'wheat' }}>{count}</div>
}

export const App = () => {
  const todo = useSelector((state) => state.todo)
  const count = useSelector((state) => state.count)
  const input = useRef()
  const { updateItem, completeItem, addItem } = useActions()

  return (
    <div className='App'>
      <h1>tiny todo {count}</h1>

      {count > 5 && <Modal />}

      <form onSubmit={onSubmit(addItem, input)}>
        <input
          className='Todo-input'
          type='text'
          ref={input}
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

      {todo.items.length === 0 && <div className='Todo-empty'>Take a break!</div>}

      <Hint />
    </div>
  )
}

function onSubmit(addItem, $input) {
  return function (e) {
    e.preventDefault()
    addItem('addItem')
    $input.current.focus()
  }
}
