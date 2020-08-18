import "react-native-gesture-handler";
import * as log from "loglevel";
import { registerRootComponent } from "expo";
import React, { useState } from "react";
import firebase from "firebase";
import Firebase from "./services/Firebase";
import LoginScreen from "./components/LoginScreen";
import NotesScreen from "./components/NotesScreen";
import AddNoteScreen from "./components/AddNoteScreen";
import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "./services/Navigation";
import { Logging } from "kmgmt-common";

Logging.configure(log);
const app = Firebase.init();

export function App() {
  const logger = log.getLogger("App");
  logger.debug("Loading App");
  const [userAuth, setUserAuth] = useState(firebase.auth().currentUser);

  app.auth().onAuthStateChanged((auth) => {
    setUserAuth(auth);
  });

  return (
    <NavigationContainer>
      {userAuth ? (
        <Stack.Navigator>
          <Stack.Screen name="Notes" component={NotesScreen} />
          <Stack.Screen name="AddNote" component={AddNoteScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Notes" component={NotesScreen} />
          <Stack.Screen name="AddNote" component={AddNoteScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default registerRootComponent(App);
