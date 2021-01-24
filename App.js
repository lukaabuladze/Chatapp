// @refresh reset
import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect, useCallback } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, TextInput, View, YellowBox, Button, Text } from 'react-native'
import * as firebase from 'firebase'
import 'firebase/firestore'


var firebaseConfig = {
  apiKey: "AIzaSyBP1tnuNwMyj0EwTVhchuyiwu0CKsSlDBw",
  authDomain: "chatapp-9bd7b.firebaseapp.com",
  projectId: "chatapp-9bd7b",
  storageBucket: "chatapp-9bd7b.appspot.com",
  messagingSenderId: "565988017821",
  appId: "1:565988017821:web:882b01b31e26e58e05b674",
  measurementId: "G-L0N8RPEQQE"
};





if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')


export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])
 
  useEffect(() => {
    readUser()
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
        const messagesFirestore = querySnapshot
            .docChanges()
            .filter(({ type }) => type === 'added')
            .map(({ doc }) => {
                const message = doc.data()
                return { ...message, createdAt: message.createdAt.toDate() }
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        appendMessages(messagesFirestore)
    })
    return () => unsubscribe()
  }, [])

  const appendMessages = useCallback(
    (messages) => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
    },
    [messages]
)


  async function readUser() {
    const user = await AsyncStorage.getItem('user')
    if (user) {
      setUser(JSON.parse(user))
    }

  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7)
    const user = { _id, name }
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  async function handleSend(messages) {
    const writes = messages.map((m) => chatsRef.add(m))
    await Promise.all(writes)
}


  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.txt}> პირველი ქართული გაცნობის ჩატი</Text>
        <TextInput style={styles.input} placeholder="ჩაწერე შენი ზედმეტსახელი" value={name} onChangeText={setName} />
        <Button onPress={handlePress} title="შემოუერთდი ჩატს!" />
      </View>
    )
  }

  return (

      <GiftedChat messages={messages} user={user} onSend={handleSend} />


  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray',
  },
  txt:{
  padding: 15,
  marginBottom: 100,
  backgroundColor: 'green',
  },
})