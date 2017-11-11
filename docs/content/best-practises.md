---
title: Best practises
---

* rerender via deferred timeout
* never mutate the state directly

* keep actions close to the store, not close to the views

Your application state is a tree of data. Your UI is a separate tree of views. They don't always map 1-1. Keep your UIs dumb, project state into the UI. Keep your logic for manipulating data, or transitioning state separate from the UI.

It is, however, possible to import actions from components or modules of the application. One could imagine doing something like this:

```js
const actions = {
    dashboard: require('./modules/dashboards/actions'),
    feed: dashboard: require('./modules/feed/actions'),
    settings: dashboard: require('./modules/settings/actions')
}

// somewere in modules/feed/post.js

split('feed/addComment', { text: hello })

// in modules/feed/actions.js

module.exports.addComment = (get, split, payload) {
  const postId = get().feed.currentPostId
  split({ display: { spinner: true }})
  const comment = await axios.post(`/posts/${postId}/comments`, payload)
  split({ display: { spinner: false }})
  split({ entities: { comments: { [comment.id]: comment } } })
  const comments = _.get(get(), ['entities', 'posts', postId, 'comments'])
  split({ entities: { posts: { [postId]: { comments: comments.concat([comment]) } } })
}

```

* custom merging strategies, in particular deepMerge, deepAssign

```
const {assign, keys, each} = require('slapdash')

module.exports = function deepMerge (prev, next) {
  const merged = assign({}, prev, next)
  each(keys(next), key => {
    if (prev && next && next[key] !== prev[key] && isObject(next[key]) && isObject(prev[key])) {
      merged[key] = deepMerge(prev[key], next[key])
    }
  })
  return merged
}

function isObject (obj) {
  return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]'
}
```

* don't be afraid to experiment

* [zaphod](https://zaphod.surge.sh/) for immutably updating data structures

