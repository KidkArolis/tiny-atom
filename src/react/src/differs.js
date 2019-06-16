export function differs(mappedProps, nextMappedProps) {
  if (mappedProps === nextMappedProps) {
    return false
  }
  if (!mappedProps || !nextMappedProps) {
    return true
  }
  if (!isObject(mappedProps) || !isObject(nextMappedProps)) {
    return true
  }
  for (let i in mappedProps) {
    if (mappedProps[i] !== nextMappedProps[i]) return true
  }
  for (let i in nextMappedProps) {
    if (!(i in mappedProps)) return true
  }
  return false
}

function isObject(obj) {
  return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]'
}
