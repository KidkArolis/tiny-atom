import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import createAtom from 'tiny-atom'
import { Provider } from 'tiny-atom/react'
import Counter from './Counter'

const atom = createAtom({ count: 0 }, { inc, dec })

function inc({ get, set }) {
  set({ count: get().count + 1 })
  console.log('Incremented', get())
}

function dec({ get, set }) {
  set({ count: get().count - 1 })
  console.log('Decremented', get())
}

atom.observe(function () {
  console.log('Changed!!?', atom.get())
})

export default class App extends React.Component {
  render() {
    return (
      <Provider atom={atom}>
        <View style={styles.container}>
          <Text>Open up App.js to start working on your app!</Text>
          <Counter />
        </View>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
