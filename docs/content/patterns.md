---
title: Patterns
---

Coming soon.

## Importing modules

**NOTE - this article needs editing**

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