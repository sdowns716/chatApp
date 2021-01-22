import React, { Component } from 'react';
import { Text, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";

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
        avatar:""
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
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
          await firebase.auth().signInAnonymously();
        }
        //Update user state with currently active user data
        this.setState({
          isConnected: true,
          user: {
            _id: user.uid,
            name: this.props.route.params.name,
            avatar: 'https://placeimg.com/140/140/any'
          },
          loggedInText: `${this.props.route.params.name} has entered the chat`,
          messages: []
        });
        this.unsubscribe = this.referenceMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate)
      });
    } else {
      this.setState({
        isConnected: false
      });
      this.getMessages();
    }
  });
};

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
    }


onSend(messages = []) {
  this.setState(previousState => ({
    messages: GiftedChat.append(previousState.messages, messages),
  }), () => {
    this.saveMessages();
  });
}

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

//get messages from asyncStorage
async getMessages() {
  let messages = '';
  try {
    messages = await AsyncStorage.getItem('messages') || [];
    this.setState({
      messages: JSON.parse(messages)
    });
  } catch (error) {
    console.log(error.message);
  }
};  componentWillUnmount() {
  this.authUnsubscribe();
  this.unsubscribe();
}  

async saveMessages() {
  try {
    await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
  } catch (error) {
    console.log(error.message);
  }
}

async deleteMessages() {
  try {
    await AsyncStorage.removeItem('messages');
    this.setState({
      messages: []
    })
  } catch (error) {
    console.log(error.message);
  }
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
          avatar: data.user.avatar
        },
      });
    });
    this.setState({
      messages,
    });
  };

renderInputToolbar(props) {
  if (this.state.isConnected == false) {
  } else {
    return(
      <InputToolbar
      {...props}
      />
    );
  }
}
render() {
 
    //Get selected username
    let name = this.props.route.params.name;
    //Commented code caused a warning
    //this.props.navigation.setOptions({ title: name });

  return (
    <View
      style={{
        flex: 1,
        //Set background color to selected
        backgroundColor: this.props.route.params.color,
      }}
    >
      <Text>{this.state.loggedInText}</Text>
      <GiftedChat
        messages={this.state.messages}
        onSend={(messages) => this.onSend(messages)}
        user={this.state.user}
        renderInputToolbar={this.renderInputToolbar.bind(this)}
      />
    </View>
  );
}}