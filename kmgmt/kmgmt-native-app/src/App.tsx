import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import * as React from "react";
import "./services/Firebase";
import firebase from "firebase";
import {
  Button,
  StyleSheet,
  View,
  StatusBar,
  FlatList,
  Text,
} from "react-native";
import * as Google from "expo-google-app-auth";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";

// Param list
type StackParamList = {
  Login: undefined;
  Notes: undefined;
};

const Stack = createStackNavigator<StackParamList>();
type NotesScreenNavigationProp = StackNavigationProp<StackParamList, "Notes">;
type LoginScreenNavigationProp = StackNavigationProp<StackParamList, "Login">;

async function login(): Promise<Google.LogInResult> {
  const config = {
    iosClientId:
      "259671952872-lpsqbf7kkufjp2nq6psogcpda5gqk5j4.apps.googleusercontent.com",
    androidClientId:
      "259671952872-8fjmi27dhntrl6ohqqcun26j4ni1ha6f.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  };
  try {
    const result = await Google.logInAsync(config);
    console.log(`result ${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    console.log(`got error ${JSON.stringify(e)}`);
    return { type: "cancel" };
  }
}

function LoginView(props: { navigation: LoginScreenNavigationProp }) {
  const [result, setResult] = React.useState<Google.LogInResult>();

  React.useEffect(() => {
    if (result?.type === "success") {
      const idToken = result.idToken;
      console.log(`got ${idToken}`);
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      firebase.auth().signInWithCredential(credential);
    }
  }, [result]);

  return (
    <View style={styles.container}>
      <Button
        title="Login"
        onPress={async () => {
          const loginResult = await login();
          setResult(loginResult);
          props.navigation.navigate("Notes");
        }}
      />
      <StatusBar />
    </View>
  );
}

const firestore = firebase.firestore();

function NotesView(props: { navigation: NotesScreenNavigationProp }) {
  const [notes, setNotes] = React.useState<{ title: string; body: string }[]>(
    []
  );
  React.useEffect(() => {
    async function getNotes() {
      const email = firebase.auth().currentUser?.email;
      console.log(`using email for fetch; email = ${email}`);
      if (email) {
        const coll = await firestore
          .collection("users")
          .doc(email)
          .collection("notes")
          .get();
        const fetchedNotes = coll.docs.map((doc) => {
          return {
            title: doc.data().title,
            body: doc.data().body,
          };
        });
        console.log(`notes = ${fetchedNotes}`);
        setNotes(fetchedNotes);
      }
    }
    getNotes();
  }, [firestore, firebase]);

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={({ item }) => <Text style={styles.item}>{item.body}</Text>}
      />
      <StatusBar />
    </View>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginView} />
        <Stack.Screen name="Notes" component={NotesView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export default registerRootComponent(App);
