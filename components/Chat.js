import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

//require Firebase and Cloud Firestore
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends Component {
  constructor(){
    super();
    this.state = {
      messages: [],
      user: {
        _id: "",
        name: "",
      },
      loggedInText: "",
    };

const firebaseConfig = {
  apiKey: "AIzaSyCYuTnoyae3TTpOF8eKHIuNTvFOxnI8jww",
    authDomain: "chatapp-a61ac.firebaseapp.com",
    projectId: "chatapp-a61ac",
    storageBucket: "chatapp-a61ac.appspot.com",
    messagingSenderId: "544735696816",
    appId: "1:544735696816:web:bc4588b29d5587d4d6a875",
    measurementId: "G-PYM6WPVV34",
  }

  if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
    }

  this.referenceMessages = firebase.firestore().collection("messages");
  }

  //authenticates the user, sets the state to sned messages and gets past messages
  componentDidMount() {
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        _id:  user.uid,
        name: this.props.route.params.name,
        loggedInText: 'Hello there',
        messages: [],
      });
    });
      this.unsubscribe = this.referenceMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    };

  componentWillUnmount() {
      this.authUnsubscribe();
      this.unsubscribe();
    }

    onSend(messages = []) {
      this.setState(
        (previousState) => ({
          messages: GiftedChat.append(previousState.messages, messages),
        }),
        () => {
          this.addMessages();
        });
    }

    //Updates the messages in the state
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // loop through documents
    querySnapshot.forEach((doc) => {
      // get data snapshot
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
      });
    });
    this.setState({
      messages,
    });
  };

  //Pushes messages to Firestore database
  addMessages = () => {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      sent: true,
    });
  };

  render() {
    //Get seleceted background color
    let bcolor = this.props.route.params.color;
    //Get selected user name
    let name = this.props.route.params.name;
    //Set title to usernam
    this.props.navigation.setOptions({ title: name });

  return (
    <View
      style={{
        flex: 1,
        //Set background color to selected
        backgroundColor: bcolor,
      }}
    >
      <Text>{this.state.loggedInText}</Text>
      <GiftedChat
        messages={this.state.messages}
        onSend={(messages) => this.onSend(messages)}
        user={this.state.user}
      />
    </View>
  );
}
}