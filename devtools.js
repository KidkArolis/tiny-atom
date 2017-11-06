module.exports = function dev ({ type, atom, patch, sourceActions }) {
  if (!atom.ext) {
    if (!window.devToolsExtension && !window.top.devToolsExtension) {
      atom.ext = {}
      console.log('No devtools extension found')
      return
    }
    atom.ext = (window.devToolsExtension || window.top.devToolsExtension).connect()
    atom.ext.subscribe(message => {
      if (message.type === 'DISPATCH' && (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE')) {
        atom.ext.dontSendNext = true
        atom.split(JSON.parse(message.state))
        atom.ext.dontSendNext = false
      }
    })
  }

  if (!atom.ext.send) return

  if (type === 'update') {
    var action = sourceActions.length ? sourceActions[sourceActions.length - 1] : { type: '--', payload: patch }
    var devtoolsAction = {
      seq: action.seq,
      type: sourceActions.length ? sourceActions.map(a => a.type).join('/') : action.type,
      payload: action.payload,
      patch: patch
    }

    if (!atom.ext.dontSendNext) {
      atom.ext.send(devtoolsAction, atom.get())
    }
  }
}
