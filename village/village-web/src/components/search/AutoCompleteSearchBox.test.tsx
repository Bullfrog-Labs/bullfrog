import { render } from "@testing-library/react";
import React from "react";
import { UserRecord } from "../../services/store/Users";
import { AutocompleteSearchBox } from "./AutocompleteSearchBox";

const user0: UserRecord = {
  uid: "123",
  displayName: "Foo Bar",
  username: "foo",
};

test("renders AutocompleteSearchBox", () => {
  render(
    <AutocompleteSearchBox
      user={user0}
      onClose={jest.fn()}
      getSuggestions={jest.fn()}
      setShowProgress={jest.fn()}
      createPost={jest.fn()}
    />
  );
});
