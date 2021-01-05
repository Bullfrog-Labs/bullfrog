import React from "react";
import { screen, render, waitFor } from "@testing-library/react";
import { CreateNewPostView, PostView, PostViewController } from "./PostView";
import {
  EMPTY_RICH_TEXT,
  stringToSlateNode,
} from "../components/richtext/Utils";
import { MemoryRouter, Route, Router } from "react-router-dom";
import { MentionNodeData } from "@blfrg.xyz/slate-plugins";

import { createMemoryHistory } from "history";
import { PostId } from "../services/store/Posts";
import { GetUserFn, UserId, UserRecord } from "../services/store/Users";

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

const viewer: UserRecord = {
  uid: "456",
  displayName: "baz",
  username: "baz",
};

const author: UserRecord = {
  uid: "123",
  displayName: "qux",
  username: "qux",
};

test("Renders PostView", () => {
  const props = {
    readOnly: false,
    postRecord: {
      id: "foo",
      authorId: "123",
      title: "bar",
      body: EMPTY_RICH_TEXT,
    },
    viewer: viewer,
    author: author,

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

test("PostView to PostView navigation works", async () => {
  const history = createMemoryHistory();
  const posts = [
    {
      id: "abc",
      authorId: author.uid,
      body: EMPTY_RICH_TEXT,
      title: "Foo",
    },
    {
      id: "def",
      authorId: author.uid,
      body: stringToSlateNode("Non-empty"),
      title: "Bar",
    },
  ];

  const postsMap = new Map(posts.map((post) => [post.id, post]));

  const getUser: GetUserFn = jest.fn(async () => author);
  const getPost = jest.fn(async (uid: UserId, postId: PostId) => {
    return postsMap.get(postId);
  });

  const getGlobalMentions = jest.fn(async (titlePrefix: string) => {
    return posts;
  });

  const props = {
    viewer: viewer,
    getUser: getUser,
    getPost: getPost,
    getGlobalMentions: getGlobalMentions,
    renamePost: jest.fn(),
    syncBody: jest.fn(),
    createPost: jest.fn(),
  };

  history.push(`/post/${author.uid}/abc`);

  render(
    <Router history={history}>
      <Route exact path="/post/:authorId/:postId">
        <PostViewController {...props} />
      </Route>
    </Router>
  );

  await waitFor(() => screen.getByText("Foo"));

  // TODO: disabled: enable after merging fixes in
  // https://github.com/Bullfrog-Labs/bullfrog/pull/61 await waitFor(() =>
  // history.push(`/post/${author.uid}/def`);
  // screen.getByText("Bar"));
});
