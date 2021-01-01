import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class Chat extends Component {
  render() {
    //access name and color props from StartScreen
    let { name, color } = this.props.route.params;
    this.props.navigation.setOptions({ title: name, backgroundColor: color });

    return (
      <View style={[styles.container, { backgroundColor: color }]}>
        <Text style={styles.welcomeText}>Welcome to the Chat</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    color: "#D72BD8"
  },
});