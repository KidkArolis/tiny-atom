module.exports = function log (info) {
  if (info.type === 'start') {
    console.log('%c•• Initial state', 'font-weight: bold', info.atom.get())
    return
  }

  var isAction = info.type === 'action'
  var prefix = isAction ? (info.sourceActions.length ? ' ' : '•') + '•' : info.sourceActions.length ? '  ' : '•• --%c'
  var title = info.sourceActions.concat(isAction ? [info.action] : []).map(s => s.type + ' (' + s.seq + ')')
  var formattedTitle = title.map((s, i, l) => l.length - 1 === i ? `%c${s || ''}` : s).join(' → ')
  console.groupCollapsed(...[
    prefix + ' %c' + formattedTitle,
    'color: #888',
    'color: black',
    info.action.payload || ''
  ])
  console.log('type %c' + info.type, 'color: blue')
  if (isAction) {
    console.log('action', info.action)
  }
  console.log('actions', info.sourceActions)
  if (!isAction) {
    console.log('patch', info.action.payload)
    console.log('prevState', info.prevState)
    console.log('currState', info.atom.get())
  }
  console.groupEnd()
}
