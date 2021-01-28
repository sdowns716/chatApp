import React, { Component } from 'react';
import { Text, View, Image } from 'react-native';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import MapView from 'react-native-maps';
import CustomActions from './CustomActions.js';

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
        avatar:"",
      },
      loggedInText: "",
      image: null,
      location: null
    };

    const firebaseConfig = {
      apiKey: "AIzaSyCYuTnoyae3TTpOF8eKHIuNTvFOxnI8jww",
      authDomain: "chatapp-a61ac.firebaseapp.com",
      projectId: "chatapp-a61ac",
      storageBucket: "chatapp-a61ac.appspot.com",
      messagingSenderId: "544735696816",
      appId: "1:544735696816:web:bc4588b29d5587d4d6a875",
      measurementId: "G-PYM6WPVV34"
    };

  if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
    }

this.referenceMessages = firebase.firestore().collection("messages");
}    
    
//authenticates  user, sets the state to send and receive
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


onSend = (messages = []) => {
  this.setState(previousState => ({
    messages: GiftedChat.append(previousState.messages, messages),
  }), () => {
    this.addMessages();
    this.saveMessages();
  });
}

  //Sends messages to Firestore database
  addMessages = async = () => {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      sent: true,
      image: message.image || null,
      location: message.location || null,
    });
  };

//get messages from asyncStorage
getMessages = async () => {
  let messages = '';
  try {
    messages = (await AsyncStorage.getItem('messages')) || [];
    this.setState({
      messages: JSON.parse(messages)
    });
  } catch (error) {
    console.log(error.message);
  }
};  

componentWillUnmount() {
  this.authUnsubscribe();
  this.unsubscribe();
}  

saveMessages = async () => {
  try {
    await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
  } catch (error) {
    console.log(error.message);
  }
}

deleteMessages = async() => {
  try {
    await AsyncStorage.removeItem('messages');
    this.setState({
      messages: []
    })
  } catch (error) {
    console.log(error.message);
  }
}

onCollectionUpdate = querySnapshot => {
  const messages = [];
  // loop through documents
  querySnapshot.forEach(doc => {
    // get data snapshot
    const data = doc.data();
    messages.push({
      _id: data._id,
      text: data.text.toString(),
      createdAt: data.createdAt.toDate(),
      user: {
        _id: data.user._id,
        name: data.user.name,
        avatar: data.user.avatar,
      },
      image: data.image || '',
      location: data.location || '',
    });
  });
  this.setState({
    messages
  });
};

renderInputToolbar = (props) => {
  if (this.state.isConnected == false) {
  } else {
    return(
      <InputToolbar
      {...props}
      />
    );
  }
}


renderCustomActions = (props) => {
  return <CustomActions {...props} />;
}

renderCustomView = (props) => {
  const { currentMessage } = props;
  if (currentMessage.location) {
    return (
      <View>
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        />
      </View>
    );
  }
  return null;
}

render() {
 
    let name = this.props.route.params.name;
    //Commented code caused a warning
    //this.props.navigation.setOptions({ title: name });

  return (
    <View
      style={{
        flex: 1,
        //Set background color to selected
        backgroundColor: this.props.route.params.color,
        justifyContent: 'center'
      }}
    >

      <Text>{this.state.loggedInText}</Text>
      {this.state.image && 
        <Image source={{uri: this.state.image.uri}} style={{width: 200, height: 200}} />
      }
      <GiftedChat
        renderCustomView={this.renderCustomView}
        renderActions={this.renderCustomActions}
        messages={this.state.messages}
        onSend={(messages) => this.onSend(messages)}
        image={this.state.image}
        user={this.state.user}
        renderInputToolbar={this.renderInputToolbar.bind(this)}
      />
    </View>
  );
}
}