---
title: Prior art
---

This section reviews how **Tiny Atom** differs from existing state management solutions. It also lists some alternative approaches to state management.

## Redux

Ok, so here's the question you've all been waiting for. How is **Tiny Atom** different from Redux? Yes, **Tiny Atom** is very much inspired by Redux and Redux's inspirations. We really like the idea of:

* having a single store
* which is only mutated by sending actions

It makes sense. It's something that we find easy to reason about. But having worked with Redux for a while, like [a lot of the community](https://medium.freecodecamp.org/whats-so-great-about-redux-ac16f1cc0f8b), we've gotten tired from the boilerplate and confusing api. Should I put my logic into action creators or into reducers? What if I want to access different parts of my state in the reducer? Why do I need to create constants, actions, action creators, reducers and use middleware to do anything?

By the way, this isn't meant to be an attack on Redux or it's wonderful creators! We really do like the idea behind Redux. In fact, we're still using Redux heavily in production. We just wondered - is there a simpler API that still captures the essence of Redux?

Now, **Tiny Atom** and Redux are really quite similar in most ways. What you can do in one, you can do in the other. Well, not entirely true. You can possibly do more in Redux. Especially when it comes to applying some of the more advanced side effect techniques such as [redux-saga](https://github.com/redux-saga/redux-saga).

The main difference in **Tiny Atom** is how the store handles actions. The "reducer" (called `evolve`) in **Tiny Atom** is not a pure function - it can make sync and async updates to the state. And this, we think, makes all the difference.

Let's look at some code snippets comparing the two.

#### Redux

```js
const { createStore } = require('redux')

function todos (state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}
const store = createStore(todos, ['Use Redux'])

store.dispatch({ type: 'ADD_TODO', text: 'Read the docs' })

console.log(store.getState())
// [ 'Use Redux', 'Read the docs' ]
```

#### Tiny Atom

```js
const createStore = require('tiny-atom')

function todos ({ get, set, dispatch }, { type, payload }) {
  switch (type) {
    case 'addTodo':
      let { list } = get()
      set({ list: list.concat([payload.text])
      break
  }
}
const store = createStore({ list: ['Use Tiny Atom'] }, {}, { evolve: todos })

store.dispatch('addTodo', { text: 'Read the docs' })

console.log(store.get())
// [ 'Use Tiny Atom', 'Read the docs' ]
```

The power of **Tiny Atom** comes from being able to perform many different related state transitions in a single action. Here's an example:

```js
const createAtom = require('tiny-atom')

const actions = {
  fetch: async ({ get, set, dispatch }) => {
    // first set
    set({ loading: true })
    try {
      const todos = await axios.get('/todos')
      // second set
      set({ list: get().list.concat(todos.data) })
    } catch (err) {
      // in case this errored
      set({ err })
      // dispatch another action
      dispatch('track', { event: 'fetchFailed', data: err.message })
    } finally {
      // set more
      set({ loading: false })
    }
  },

  track: (atom, payload) => {
    sentry.send(payload)
  }
}

const atom = createAtom({ list: [] }, actions)

atom.dispatch('fetch')
```

**We found that this way of asynchronously updating the state reduces the boilerplate and improves readability of the code. The relevant logic is self contained instead of being scattered around.**

To summarise, **Tiny Atom**:

* is similar to Redux
* does not have action creators
* keeps the business logic self contained inside actions
* actions can make multiple changes to the state synchronously and asynchronously

## Declarative state management

Sometimes, the single store approach isn't the best choice for your application. For really simple applications I found `react-refetch` to work really well. You bind your components directly to rest endpoints and get the data passed as props. A more powerful and quite a promising approach is to use GraphQL based frameworks. Each of your components binds data and state with GraphQL fragments that get combined and resolved.

* [apollo-client](https://github.com/apollographql/apollo-client)
* [react-refetch](https://github.com/heroku/react-refetch)

## Dispatching functions

There exists another wave of Redux alternatives that try and do away with the boilerplate by dispatching state modifying functions directly instead of dispatching actions as plain objects. For example:

* [redux-zero](https://github.com/concretesolutions/redux-zero)
* [elfi](https://github.com/madx/elfi)
* [refnux](https://github.com/algesten/refnux)

These look very cool and we're still wondering if they are a better alternative. They allow to contain the state transition logic closer to components. Having said that, there's something nice about the mental model of sending messages to a central place and containing the state transitions completely outside of components. Your views are a tree which is a projection of your state tree. Keeping the two separate and independent makes some sense.

## Cursors

When [Om](https://github.com/omcljs/om) first came around, it popularised the cursor approach to managing the state. The idea was roughly to pass around an object – cursor, which could be used to read the state. It could then also be used to mutate the state directly, but instead of mutating the object in place it would trigger an update to subscribers with the new updated state.

In a lot of ways, it's not too dissimilar from passing a **Tiny Atom** atom around which you use to read the state.

*Note: apologies if I'm misunderstanding cursors entirely, feel free to post an GH issue or edit this page*.

* [baobab](https://github.com/Yomguithereal/baobab)

## Observables and fractals

Another fascinating approach, but I'm not familiar enough to comment much further. Observables seem to be quite cool if you "get" them, but I've been recently wondering if they don't match everyone's mental model.

* [cycle-onionify](https://github.com/staltz/cycle-onionify)
