import React from "react";
import { render } from "@testing-library/react";
import { CreateNewPostView, PostView } from "./PostView";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { MemoryRouter } from "react-router-dom";
import { MentionNodeData } from "@blfrg.xyz/slate-plugins";

test("Renders CreateNewPostView", () => {
  const createPost = jest.fn();
  const redirectAfterCreate = jest.fn();

  const onMentionSearchChanged = jest.fn();
  const mentionables: MentionNodeData[] = [];
  const onMentionAdded = jest.fn();

  const { getByText } = render(
    <CreateNewPostView
      createPost={createPost}
      redirectAfterCreate={redirectAfterCreate}
      onMentionSearchChanged={onMentionSearchChanged}
      mentionables={mentionables}
      onMentionAdded={onMentionAdded}
    />
  );

  const titleEl = getByText("Enter a title");
  expect(titleEl).toBeInTheDocument();
});

test("Renders PostView", () => {
  const props = {
    readOnly: false,
    postRecord: {
      id: "foo",
      authorId: "123",
      title: "bar",
      body: EMPTY_RICH_TEXT,
    },
    viewer: {
      uid: "456",
      displayName: "baz",
      username: "baz",
    },
    author: {
      uid: "123",
      displayName: "qux",
      username: "qux",
    },

    getTitle: jest.fn(),
    renamePost: jest.fn(),
    syncBody: jest.fn(),

    onMentionSearchChanged: jest.fn(),
    mentionables: [],
    onMentionAdded: jest.fn(),
  };

  const { getByText } = render(
    <MemoryRouter initialEntries={["/post/foo"]} initialIndex={0}>
      <PostView {...props} />
    </MemoryRouter>
  );

  const titleEl = getByText("bar");
  expect(titleEl).toBeInTheDocument();

  const authorEl = getByText("qux");
  expect(authorEl).toBeInTheDocument();
});
