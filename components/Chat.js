import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';


export default class Chat extends Component {
  constructor(props){
    super(props);
    this.state = {
      messages: [],
    }
  }

  componentDidMount() {
    // access name prop from Start Screen and set as title in Navigation bar
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
    this.setState({
      messages: [
        {
          _id: 1,
          text: `Hello, ${this.props.route.params.name}. Welcome to the chat!`,
          createdAt: new Date(),
          system: true,
        },
        {
          _id: 2,
          text: "This is a system message",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
      ],
    });
  }
  
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }

  render() {
    //access name and color props from StartScreen
    let { name, color } = this.props.route.params;
    this.props.navigation.setOptions({ title: name, backgroundColor: color });

    return (
      <View style={[styles.container, { backgroundColor: color }, {flex: 1}]}>
        <Text style={styles.welcomeText}>Welcome to the Chat</Text>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }  
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