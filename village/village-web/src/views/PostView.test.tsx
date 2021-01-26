import React from "react";
import { screen, render, waitFor } from "@testing-library/react";
import { EditablePostView, PostViewController } from "./PostView";
import {
  EMPTY_RICH_TEXT,
  stringToSlateNode,
  MentionInContext,
} from "../components/richtext/Utils";
import { MemoryRouter, Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { PostId, UserPost, PostRecord } from "../services/store/Posts";
import {
  GetUserByUsernameFn,
  GetUserFn,
  UserId,
  UserRecord,
} from "../services/store/Users";
import { userPosts0 } from "../testing/Fixtures";
import { postURL, postURLById } from "../routing/URLs";
import { AuthProviderState } from "../services/auth/Auth";
import { AuthedTestUserContext } from "../testing/AuthedTestUserContext";
import { useUserFromAppAuthContext } from "../services/auth/AppAuth";

const getMentionUserPosts0 = async (): Promise<UserPost[]> => {
  return [];
};

const viewer: AppAuthState = {
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

type TestPostViewProps = {
  mentions?: MentionInContext[];
};

const TestPostView = (props: TestPostViewProps) => {
  // missing the following properties from type 'EditablePostViewProps': editablePostCallbacks

  const postProps = {
    postId: "foo",
    updatedAt: new Date(),

    title: "bar",
    setTitle: jest.fn(),

    body: EMPTY_RICH_TEXT,
    setBody: jest.fn(),

    getPost: jest.fn(),

    author: author,
    mentions: props.mentions || [],

    getTitle: jest.fn(),
    renamePost: jest.fn(),
    syncBody: jest.fn(),

    editablePostCallbacks: {
      getGlobalMentions: jest.fn(),
      renamePost: jest.fn(),
      syncBody: jest.fn(),
      createPost: jest.fn(),
      deletePost: jest.fn(),
    },
  };

  const viewer = useUserFromAppAuthContext();

  if (!!viewer) {
    return (
      <AuthedTestUserContext user={viewer}>
        <MemoryRouter initialEntries={["/post/foo"]} initialIndex={0}>
          <EditablePostView {...postProps} />
        </MemoryRouter>
      </AuthedTestUserContext>
    );
  } else {
    throw new Error("readonly view not supported yet");
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

/*
test("Renders PostView with no mentions for user logged in not as author", () => {
  render(<TestPostView />);
  testPostViewNoMentions();
});


test("Renders PostView with no mentions for logged-out user", () => {
  render(<TestPostView />);
  testPostViewNoMentions();
});

*/

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

/*
test("Renders PostView with mentions for user not logged in as author", () => {
  render(<TestPostView mentions={mentions0} />);
  testPostViewWithMentions();
});


test("Renders PostView with mentions for logged-out user", () => {
  render(<TestPostView mentions={mentions0} />);
  testPostViewWithMentions();
});
*/

// const testPostViewToPostViewNavigation = async (element: JSX.Element) => {

// }

/*
test("PostView to PostView navigation works", async () => {
  const history = createMemoryHistory();

  const postsMap = new Map(posts.map((post) => [post.id, post]));

  const getUser: GetUserFn = jest.fn(async () => author);
  const getUserByUsername: GetUserByUsernameFn = jest.fn(async () => author);
  const getPost = jest.fn(async (uid: UserId, postId: PostId) => {
    return postsMap.get(postId);
  });

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
        <PostViewController {...props} />
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
});
*/
