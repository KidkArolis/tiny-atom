---
title: Using with Zaphod
---

[Zaphod](https://zaphod.surge.sh/) is a really neat library for updating plain JavaScript objects in immutable ways. In particular functions like `get`, `getIn`, `set`, `setIn`, `unset`, `update`, `updateIn`, `push`, `pop`, `merge` all make it quite easy to update your state without mutating it. It's a great alternative to libraries such as Immutable.js. While Immutable is great - it has a fairly large API surface and conceals data within custom objects making it harder to debug. We all wish JavaScript supported immutable data structures natively, but good ol plain JavaScript data structures can be more than enough. And libraries like `Zaphod` make it a joy to work with them.

**actions.js**
```js
const { getIn, setIn, updateIn, merge } = require('zaphod/compat')

module.exports = {
  fetchMoreItems: async (get, split) => {
    // check if we're already loading
    if (getIn(get(), ['feed', 'loading'])) return

    // set loading true
    split(setIn(get(), ['feed', 'loading'], true))

    // get next page cursor and fetch the data
    const nextPage = getIn(get(), ['feed', 'nextPage'])
    const { data } = axios.get('/feed?page=' + nextPage)

    // merge the newly loaded items into the feed
    split(updateIn(get(), ['feed'], feed => merge(feed, {
      loading: false,
      nextPage: data.nextPage,
      items: feed.items.concat(data.items)
    })))
}
```