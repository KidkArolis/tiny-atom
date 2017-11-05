module.exports = function devtools (atom) {
  if (!window.devToolsExtension && !window.top.devToolsExtension) {
    console.log('No devtools extension found')
    return
  }

  const ext = (window.devToolsExtension || window.top.devToolsExtension).connect()

  let dontSendNext = false

  ext.subscribe(message => {
    if (message.type === 'DISPATCH' && (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE')) {
      dontSendNext = true
      atom.split(JSON.parse(message.state))
    } else {
      console.log(message)
    }
  })

  return function debug ({ type, atom, patch, sourceActions }) {
    if (type === 'update') {
      var action = sourceActions.length ? sourceActions[sourceActions.length - 1] : { type: '--update--', payload: patch }
      var devtoolsAction = {
        seq: action.seq,
        type: sourceActions.length ? sourceActions.map(a => a.type).join('/') : action.type,
        payload: action.payload,
        patch: patch
      }
      if (!dontSendNext) {
        ext.send(devtoolsAction, atom.get())
      }
    }
  }
}
