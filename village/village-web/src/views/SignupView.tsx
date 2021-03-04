import React from "react";

interface SignupViewProps {}

export const SignupView: React.FunctionComponent<SignupViewProps> = (
  props = {}
) => {
  window.location.href = "https://signup.village.ink";
  return <></>;
};
