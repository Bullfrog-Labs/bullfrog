import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React from "react";
import { MemoryRouter, Route, Router } from "react-router-dom";
import {
  EMPTY_RICH_TEXT,
  MentionInContext,
  stringToSlateNode,
} from "../components/richtext/Utils";
import { postURL, postURLById } from "../routing/URLs";
import { useIsLoggedInAsUser } from "../services/auth/AppAuth";
import { PostId, PostRecord, UserPost } from "../services/store/Posts";
import {
  GetUserByUsernameFn,
  GetUserFn,
  UserId,
  UserRecord,
} from "../services/store/Users";
import { AuthedTestUserContext } from "../testing/AuthedTestUserContext";
import { userPosts0 } from "../testing/Fixtures";
import {
  EditablePostView,
  PostViewController,
  PostViewControllerProps,
  ReadOnlyPostView,
} from "./PostView";

const getMentionUserPosts0 = async (): Promise<UserPost[]> => {
  return [];
};

const viewer = {
  uid: "456",
  displayName: "baz",
  username: "baz",
};

const author = {
  uid: "123",
  displayName: "qux",
  username: "qux",
};

const users = [viewer, author];

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
  {
    id: "ghi",
    authorId: viewer.uid,
    body: stringToSlateNode("Not the author"),
    title: "Baz",
    mentions: [],
  },
];

type TestPostViewProps = {
  mentions?: MentionInContext[];
};

const TestPostView = (props: TestPostViewProps) => {
  const commonPostProps = {
    postId: "foo",
    updatedAt: new Date(),
    author: author,
    mentions: props.mentions || [],

    title: "bar",
    body: EMPTY_RICH_TEXT,
  };

  const loggedInAsAuthor = useIsLoggedInAsUser(author.uid);

  if (loggedInAsAuthor) {
    const postProps = {
      ...commonPostProps,
      setTitle: jest.fn(),
      setBody: jest.fn(),
      getPost: jest.fn(),

      editablePostCallbacks: {
        getGlobalMentions: jest.fn(),
        renamePost: jest.fn(),
        syncBody: jest.fn(),
        createPost: jest.fn(),
        deletePost: jest.fn(),
      },
    };
    return (
      <AuthedTestUserContext user={viewer}>
        <MemoryRouter initialEntries={["/post/foo"]} initialIndex={0}>
          <EditablePostView {...postProps} />
        </MemoryRouter>
      </AuthedTestUserContext>
    );
  } else {
    return (
      <MemoryRouter initialEntries={["/post/foo"]} initialIndex={0}>
        <ReadOnlyPostView {...commonPostProps} />
      </MemoryRouter>
    );
  }
};

const testPostViewNoMentions = () => {
  const titleEl = screen.getByText("bar");
  expect(titleEl).toBeInTheDocument();

  const authorEl = screen.getByText("qux");
  expect(authorEl).toBeInTheDocument();

  const mentionsEl = screen.queryByText("Mentions");
  expect(mentionsEl).toBeNull();
};

test("Renders PostView with no mentions for user logged in as author", () => {
  render(
    <AuthedTestUserContext user={author}>
      <TestPostView />
    </AuthedTestUserContext>
  );
  testPostViewNoMentions();
});

test("Renders PostView with no mentions for user logged in not as author", () => {
  render(
    <AuthedTestUserContext user={viewer}>
      <TestPostView />
    </AuthedTestUserContext>
  );
  testPostViewNoMentions();
});

test("Renders PostView with no mentions for logged-out user", () => {
  render(<TestPostView />);
  testPostViewNoMentions();
});

const mentions0: MentionInContext[] = userPosts0.map((up) => {
  return {
    post: up,
    text: stringToSlateNode("here i am, mr. mention!"),
    path: [0],
    truncatedStart: false,
    truncatedEnd: false,
  };
});

const testPostViewWithMentions = (element: JSX.Element) => {
  render(element);

  const titleEl = screen.getByText("bar");
  expect(titleEl).toBeInTheDocument();

  const authorEl = screen.getByText("qux");
  expect(authorEl).toBeInTheDocument();

  const mentionsEl = screen.getByText("Mentions");
  expect(mentionsEl).toBeInTheDocument();

  const mentionTitleEls = screen.queryAllByText("Title mane");
  expect(mentionTitleEls.length).toEqual(2);
};

test("Renders PostView with mentions for user logged in as author", () => {
  testPostViewWithMentions(
    <AuthedTestUserContext user={author}>
      <TestPostView mentions={mentions0} />
    </AuthedTestUserContext>
  );
});

test("Renders PostView with mentions for user not logged in as author", () => {
  testPostViewWithMentions(
    <AuthedTestUserContext user={viewer}>
      <TestPostView mentions={mentions0} />
    </AuthedTestUserContext>
  );
});

test("Renders PostView with mentions for logged-out user", () => {
  testPostViewWithMentions(<TestPostView mentions={mentions0} />);
});

const testPostViewToPostViewNavigation = async (
  propsToPostViewController: (
    props: PostViewControllerProps
  ) => React.ReactChild
) => {
  const history = createMemoryHistory();

  const postsMap = new Map(
    posts.map((post) => [`${post.authorId}/${post.id}`, post])
  );
  const getPost = jest.fn(async (uid: UserId, postId: PostId) =>
    postsMap.get(`${uid}/${postId}`)
  );

  const userIdToUser = new Map(users.map((user) => [user.uid, user]));
  const getUser: GetUserFn = jest.fn(async (uid) => userIdToUser.get(uid));

  const usernameToUser = new Map(users.map((user) => [user.username, user]));
  const getUserByUsername: GetUserByUsernameFn = jest.fn(async (username) =>
    usernameToUser.get(username)
  );

  const props = {
    getUser: getUser,
    getUserByUsername: getUserByUsername,
    getPost: getPost,

    getMentionUserPosts: getMentionUserPosts0,

    editablePostCallbacks: {
      getGlobalMentions: jest.fn(async () => {
        return [];
      }),
      renamePost: jest.fn(),
      syncBody: jest.fn(),
      createPost: jest.fn(),
      deletePost: jest.fn(),
    },
  };

  render(
    <Router history={history}>
      <Route exact path="/post/:authorIdOrUsername/:postId">
        {propsToPostViewController(props)}
      </Route>
    </Router>
  );

  history.push(postURLById(author.uid, "def"));
  await waitFor(() => {
    expect(screen.getByText("Bar")).toBeInTheDocument();
  });

  history.push(postURL(author.username, "abc"));
  await waitFor(() => {
    expect(screen.getByText("Foo")).toBeInTheDocument();
  });

  history.push(postURL(author.username, "def"));
  await waitFor(() => {
    expect(screen.getByText("Bar")).toBeInTheDocument();
  });

  history.push(postURL(viewer.username, "ghi"));
  await waitFor(() => {
    expect(screen.getByText("Baz")).toBeInTheDocument();
  });
};

test("PostView to PostView navigation works when logged in", async () => {
  testPostViewToPostViewNavigation((props) => (
    <AuthedTestUserContext user={author}>
      <PostViewController {...props} />
    </AuthedTestUserContext>
  ));
});

test("PostView to PostView navigation works when logged out", async () => {
  testPostViewToPostViewNavigation((props) => (
    <PostViewController {...props} />
  ));
});
