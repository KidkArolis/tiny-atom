const Preact = require('preact') //eslint-disable-line
const { ConnectAtom } = require('tiny-atom/preact')
require('./App.css')

module.exports = () => (
  <ConnectAtom>
    {({ state, split }) => (
      <div className='App'>
        <h1>tiny todo</h1>

        <form onSubmit={onSubmit(split, this.$input)}>
          <input
            className='Todo-input'
            type='text'
            ref={el => { this.$input = el }}
            onChange={(e) => split.todo.update(e.target.value)}
            value={state.get('todo').get('input')}
          />
        </form>

        {state.get('todo').get('items').map((item, i) => (
          <div className='Todo'>
            <span className='Todo-done' onClick={() => split.todo.done(i)}>☐</span>
            {item}
          </div>
        )).toJS()}

        {state.get('todo').get('items').size === 0 &&
          <div className='Todo-empty'>Take a break!</div>
        }

        <div className='Hint'>
          {state.get('hint').get('show') ? state.get('hint').get('text') : ''}
        </div>
      </div>
    )}
  </ConnectAtom>
)

function onSubmit (split, $input) {
  return function (e) {
    split.todo.add()
    e.preventDefault()
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        $input && $input.focus()
      }, 1)
    })
  }
}
