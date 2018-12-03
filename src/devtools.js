module.exports = () => (info) => {
  const type = info.type
  const atom = info.atom
  const sourceActions = info.sourceActions
  const ext = atom.devtools

  if (!ext) {
    const devExt = window.devToolsExtension || window.top.devToolsExtension
    if (!devExt) {
      console.log('No devtools extension found')
      atom.devtools = {}
      return
    }
    atom.devtools = devExt.connect()
    atom.devtools.subscribe(function (message) {
      if (message.type === 'DISPATCH') {
        if (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE') {
          atom.devtools.ignoreNextUpdate = true
          atom.swap(JSON.parse(message.state))
          atom.devtools.ignoreNextUpdate = false
        }
      }
    })
  }

  // no devtools were connected
  if (!atom.devtools.send) {
    return
  }

  // send only updates into devtools, not actions
  if (type === 'update') {
    const action = sourceActions.length ? sourceActions[sourceActions.length - 1] : { type: '--', payload: info.action.payload }
    const updatedKeys = (!action.seq ? ' ' + ellipsis(Object.keys(action.payload || {}).join(', '), 10) : '')
    const devtoolsAction = {
      seq: action.seq,
      sourceActions: sourceActions,
      type: '(' + (action.seq || '-') + ') ' + action.type + updatedKeys,
      payload: action.payload
    }

    if (!atom.devtools.ignoreNextUpdate) {
      atom.devtools.send(devtoolsAction, atom.get())
    }
  }
}

function ellipsis (str, n) {
  return str.substr(0, n) + (str.length <= n ? '' : '...')
}
