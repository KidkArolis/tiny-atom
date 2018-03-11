export function set (obj, key, value) {
  if (obj === undefined) {
    return { [key]: value }
  }

  // cheap return if key is already set
  if (obj[key] === value) {
    return obj
  }

  const clone = copy(obj)
  clone[key] = value
  return clone
}

export function setIn (obj, keys, value) {
  if (!(keys instanceof Array)) {
    throw new TypeError(`setIn expected first argument to be an Array of keys. Not a ${type(keys)}!`)
  }

  if (keys.length === 0) {
    return obj
  }

  const isNil = obj === undefined
  const clone = isNil ? {} : copy(obj)

  let ref = clone
  let index = 0

  while (index < (keys.length - 1)) {
    const key = keys[index]

    // make sure we create the path if needed
    if (ref[key] === undefined) {
      const nextKey = keys[index + 1]
      ref[key] = typeof nextKey === 'number' ? [] : {}
    } else {
      ref[key] = copy(ref[key])
    }

    ref = ref[key]
    index += 1
  }

  ref[keys[index]] = value

  return clone
}

export function unset (obj, key) {
  if (obj === undefined) {
    return {}
  }

  // forgiving return for removing missing key
  if (!obj.hasOwnProperty(key)) {
    return obj
  }

  const clone = copy(obj)
  delete clone[key]
  return clone
}

export function get (obj, key, notFound) {
  if (obj === undefined) {
    return notFound
  }

  if (obj[key] !== undefined) {
    return obj[key]
  } else {
    return notFound
  }
}

export function getIn (obj, keys, notFound) {
  if (!(keys instanceof Array)) {
    throw new TypeError(`getIn expected first argument to be an Array of keys. Not a ${type(keys)}!`)
  }

  if (keys.length === 0) {
    return notFound
  }

  if (obj === undefined) {
    return notFound
  }

  let ref = obj
  let index = 0

  while (index < keys.length) {
    const key = keys[index]

    if (ref[key] === undefined) {
      return notFound
    } else {
      ref = ref[key]
    }

    index += 1
  }

  return ref
}

export function update (obj, key, func, ...args) {
  const clone = copy(obj)
  const val = clone[key]

  if (func === undefined) {
    clone[key] = undefined
  } else {
    clone[key] = func(val, ...args)
  }

  return clone
}

export function updateIn (obj, keys, func, ...args) {
  if (!(keys instanceof Array)) {
    throw new TypeError(`updateIn expected first argument to be an Array of keys. Not a ${type(keys)}!`)
  }

  const current = getIn(obj, keys)
  const updated =
    (func === undefined)
      ? undefined
      : func(current, ...args)

  return setIn(obj, keys, updated)
}

export function merge (obj, ...objects) {
  // filter out falsy values
  const values = objects.filter(object => object)

  return Object.assign({}, obj, ...values)
}

export function flatten (obj) {
  // forgive calls on empty values
  if (obj === undefined) {
    return []
  }

  if (!(obj instanceof Array)) {
    throw new TypeError(`flatten can only be called on arrays. Not a ${type(obj)}!`)
  }

  const stack = [obj]
  const flat = []

  while (stack.length > 0) {
    const item = stack.pop()

    if (item instanceof Array) {
      for (let i = 0; i < item.length; i++) {
        stack.push(item[i])
      }
    } else {
      flat.unshift(item)
    }
  }

  return flat
}

export function distinct (obj) {
  if (obj === undefined) {
    return []
  }

  if (!(obj instanceof Array)) {
    throw new TypeError(`distinct can only be called on arrays. Not a ${type(obj)}!`)
  }

  const unique = []

  for (let i = 0; i < obj.length; i++) {
    if (unique.indexOf(obj[i]) < 0) {
      unique.push(obj[i])
    }
  }

  return unique
}

export function push (obj, ...items) {
  if (!(obj instanceof Array)) {
    throw new TypeError(`push can only be called on arrays. Not a ${type(obj)}!`)
  }

  return obj.concat(items)
}

export function peek (obj) {
  if (obj.length) {
    return obj[obj.length - 1]
  } else {
    return undefined
  }
}

export function pop (obj) {
  if (obj === undefined) {
    return undefined
  }

  if (!(obj instanceof Array)) {
    throw new TypeError(`pop can only be called on arrays. Not a ${type(obj)}!`)
  }

  return obj.slice(0, -1)
}

export function transient (obj, func) {
  const clone = copy(obj)

  // do side effects
  func(clone)

  return clone
}

function type (any) {
  const str = Object.prototype.toString.call(any)
  return str.slice(8, -1)
}

function copy (object) {
  const keys = Object.keys(object)
  const clone = object instanceof Array ? [] : {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    clone[key] = object[key]
  }
  return clone
}
