import "react-native-gesture-handler";
import * as log from "loglevel";
import { registerRootComponent } from "expo";
import React, { useState } from "react";
import firebase from "firebase";
import Firebase from "./services/Firebase";
import LoginScreen from "./components/LoginScreen";
import AddNoteScreen from "./components/AddNoteScreen";
import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "./services/Navigation";
import { Logging } from "kmgmt-common";
import { Provider as PaperProvider } from "react-native-paper";

Logging.configure(log);
const app = Firebase.init();

function LoggedInScreens() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AddNote"
        options={{
          headerTitle: "Notes",
        }}
        component={AddNoteScreen}
      />
    </Stack.Navigator>
  );
}

function LoggedOutScreens() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="AddNote"
        options={{
          headerTitle: "Notes",
        }}
        component={AddNoteScreen}
      />
    </Stack.Navigator>
  );
}

export function App() {
  const logger = log.getLogger("App");
  logger.debug("Loading App");
  const [userAuth, setUserAuth] = useState(firebase.auth().currentUser);

  app.auth().onAuthStateChanged((auth) => {
    setUserAuth(auth);
  });

  return (
    <PaperProvider>
      <NavigationContainer>
        {userAuth ? <LoggedInScreens /> : <LoggedOutScreens />}
      </NavigationContainer>
    </PaperProvider>
  );
}

export default registerRootComponent(App);
