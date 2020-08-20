import "react-native-gesture-handler";
import * as log from "loglevel";
import { registerRootComponent } from "expo";
import { YellowBox } from "react-native";
import React, { useState } from "react";
import firebase from "firebase";
import Firebase from "./services/Firebase";
import LoginScreen from "./components/LoginScreen";
import AddNoteScreen from "./components/AddNoteScreen";
import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "./services/Navigation";
import { Logging, FirestoreDatabase } from "kmgmt-common";
import { Provider as PaperProvider } from "react-native-paper";

// This warning is not important and there's no plan to fix the underlyign
// issue right now, so suppressing it.
YellowBox.ignoreWarnings(["Setting a timer for a long period of time"]);

Logging.configure(log);
const app = Firebase.init();
const database = FirestoreDatabase.fromApp(app);

export function App() {
  const logger = log.getLogger("App");
  logger.debug("Loading App");
  const [userAuth, setUserAuth] = useState(firebase.auth().currentUser);

  function AddNoteScreenAdapter() {
    return <AddNoteScreen database={database} userAuth={userAuth} />;
  }

  function LoggedInScreens() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="AddNote"
          options={{
            headerTitle: "Notes",
          }}
          component={AddNoteScreenAdapter}
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
          component={AddNoteScreenAdapter}
        />
      </Stack.Navigator>
    );
  }

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
