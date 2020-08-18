import "react-native-gesture-handler";
import * as log from "loglevel";
import { registerRootComponent } from "expo";
import * as React from "react";
import LoginScreen from "./components/LoginScreen";
import NotesScreen from "./components/NotesScreen";
import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "./services/Navigation";
import { Logging } from "kmgmt-common";

Logging.configure(log);

export function App() {
  const logger = log.getLogger("App");
  logger.debug("Loading App");
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default registerRootComponent(App);