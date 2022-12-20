import React from 'react'
import { Button, Text } from 'react-native'
import { connect } from 'tiny-atom/react'

function mapState(state) {
  return {
    count: state.count
  }
}

const actions = ['inc', 'dec']

class Counter extends React.Component {
  render() {
    const { count, inc, dec } = this.props
    return (
      <>
        <Text>Count: {count}</Text>
        <Button title='Increment' onPress={inc} />
        <Button title='Decrement' onPress={dec} />
      </>
    )
  }
}

export default connect(
  mapState,
  actions,
  { sync: true }
)(Counter)

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center'
//   }
// })
