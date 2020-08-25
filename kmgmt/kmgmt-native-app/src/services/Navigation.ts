import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";

// Param list
export type StackParamList = {
  Login: undefined;
  Notes: undefined;
  AddNote: undefined;
};

export const Stack = createStackNavigator<StackParamList>();
export type LoginScreenNavigationProp = StackNavigationProp<
  StackParamList,
  "Login"
>;
export type AddNoteScreenNavigationProp = StackNavigationProp<
  StackParamList,
  "AddNote"
>;
