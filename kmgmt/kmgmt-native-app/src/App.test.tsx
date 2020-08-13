import "react-native-gesture-handler";
import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";

test("test dummy react to prove it works", () => {
  const view = (
    <View>
      <Text>Login</Text>
    </View>
  );
  const { getByText } = render(view);
  getByText(/Login/i);
});
