import * as log from "loglevel";
import "react-native-gesture-handler";
import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";
import { Logging } from "kmgmt-common";

Logging.configure(log);
const logger = log.getLogger("App.test");

test("test dummy react to prove it works", () => {
  logger.debug("running test!");
  const view = (
    <View>
      <Text>Login</Text>
    </View>
  );
  const { getByText } = render(view);
  getByText(/Login/i);
});
