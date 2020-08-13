import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";

// Param list
export type StackParamList = {
  Login: undefined;
  Notes: undefined;
};

export const Stack = createStackNavigator<StackParamList>();
export type NotesScreenNavigationProp = StackNavigationProp<
  StackParamList,
  "Notes"
>;
export type LoginScreenNavigationProp = StackNavigationProp<
  StackParamList,
  "Login"
>;
