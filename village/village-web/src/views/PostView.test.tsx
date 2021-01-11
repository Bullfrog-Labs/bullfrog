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
import { PostId, UserPost, PostRecord } from "../services/store/Posts";
import { GetUserFn, UserId, UserRecord } from "../services/store/Users";
import { userPosts0 } from "../testing/Fixtures";

const mentionableElementFn = (option: MentionNodeData): JSX.Element => {
  return <React.Fragment>option.value</React.Fragment>;
};

const getMentionUserPosts0 = async (postId: PostId): Promise<UserPost[]> => {
  return [];
};

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

const posts: PostRecord[] = [
  {
    id: "abc",
    authorId: author.uid,
    body: EMPTY_RICH_TEXT,
    title: "Foo",
    mentions: [],
  },
  {
    id: "def",
    authorId: author.uid,
    body: stringToSlateNode("Non-empty"),
    title: "Bar",
    mentions: [],
  },
];

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
      mentionableElementFn={mentionableElementFn}
      user={author}
    />
  );

  const titleEl = getByText("Enter a title");
  expect(titleEl).toBeInTheDocument();
});

const TestPostView = (props: { mentions?: UserPost[] }) => {
  const postProps = {
    readOnly: false,
    postId: "foo",
    title: "bar",
    setTitle: jest.fn(),
    body: EMPTY_RICH_TEXT,
    setBody: jest.fn(),
    viewer: viewer,
    author: author,
    mentions: props.mentions || [],

    getTitle: jest.fn(),
    renamePost: jest.fn(),
    syncBody: jest.fn(),

    onMentionSearchChanged: jest.fn(),
    mentionables: [],
    onMentionAdded: jest.fn(),
    mentionableElementFn: mentionableElementFn,
  };

  return (
    <MemoryRouter initialEntries={["/post/foo"]} initialIndex={0}>
      <PostView {...postProps} />
    </MemoryRouter>
  );
};

test("Renders PostView with no mentions", () => {
  const { getByText, queryByText } = render(<TestPostView />);

  const titleEl = getByText("bar");
  expect(titleEl).toBeInTheDocument();

  const authorEl = getByText("qux");
  expect(authorEl).toBeInTheDocument();

  const mentionsEl = queryByText("Mentions");
  expect(mentionsEl).toBeNull();
});

test("Renders PostView with mentions", () => {
  const mentions = userPosts0;
  const { getByText, queryAllByText } = render(
    <TestPostView mentions={mentions} />
  );

  const titleEl = getByText("bar");
  expect(titleEl).toBeInTheDocument();

  const authorEl = getByText("qux");
  expect(authorEl).toBeInTheDocument();

  const mentionsEl = getByText("Mentions");
  expect(mentionsEl).toBeInTheDocument();

  const mentionTitleEls = queryAllByText("Title mane");
  expect(mentionTitleEls.length).toEqual(2);
});

test("PostView to PostView navigation works", async () => {
  const history = createMemoryHistory();

  const postsMap = new Map(posts.map((post) => [post.id, post]));

  const getUser: GetUserFn = jest.fn(async () => author);
  const getPost = jest.fn(async (uid: UserId, postId: PostId) => {
    return postsMap.get(postId);
  });

  const getGlobalMentions = jest.fn(async (titlePrefix: string) => {
    return [];
  });

  const props = {
    viewer: viewer,
    getUser: getUser,
    getPost: getPost,
    getGlobalMentions: getGlobalMentions,
    renamePost: jest.fn(),
    syncBody: jest.fn(),
    createPost: jest.fn(),
    getMentionUserPosts: getMentionUserPosts0,
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
