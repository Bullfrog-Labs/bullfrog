import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import * as React from "react";
import "./services/Firebase";
import LoginScreen from "./components/LoginScreen";
import NotesScreen from "./components/NotesScreen";
import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "./services/Navigation";

export function App() {
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
