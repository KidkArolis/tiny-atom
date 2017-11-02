var gray = 'color: #888'
var black = 'color: black'

module.exports = function log (info) {
  var prefix

  var label = info.sourceActions
    .concat(info.type === 'action' ? [info.action] : [])
    .map(function (s) { return s.type + ' (' + s.seq + ')' })
    .map(function (s, i, l) { return l.length - 1 === i ? '%c' + s : s })
    .join(' → ') || '%c'

  if (info.type === 'action') {
    prefix = !info.sourceActions.length ? '••' : ' •'
    console.groupCollapsed(prefix + ' %c' + label, gray, black, info.action.payload || '')
    console.log('type %caction', 'color: blue')
    console.log('action', info.action)
    console.log('actions', info.sourceActions)
    console.groupEnd()
  }

  if (info.type === 'update') {
    prefix = !info.sourceActions.length ? '•• --' : '  '
    console.groupCollapsed(prefix + ' %c' + label, gray, black, info.action.payload || '')
    console.log('type %cupdate', 'color: blue')
    console.log('actions', info.sourceActions)
    console.log('patch', info.action.payload)
    console.log('prevState', info.prevState)
    console.log('currState', info.atom.get())
    console.groupEnd()
  }
}
