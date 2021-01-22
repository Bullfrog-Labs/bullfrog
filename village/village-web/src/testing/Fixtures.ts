import { stringToSlateNode } from "../components/richtext/Utils";
import { AuthProvider } from "../services/auth/Auth";
import { PostRecord, UserPost } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";

/**
 * Users
 */

export const u0: UserRecord = {
  displayName: "Leighland",
  uid: "123",
  description: "Welcome to leighland!",
  username: "l4stewar",
};
export const u1: UserRecord = Object.assign({}, u0, {
  uid: "124",
  username: "l5stewar",
});

/**
 * Posts
 */

export const p0: PostRecord = {
  title: "Title mane",
  body: stringToSlateNode("Body foo"),
  authorId: "123",
  updatedAt: new Date(),
  id: "123",
  mentions: [],
};
export const p1: PostRecord = Object.assign({}, p0, { id: "124" });
export const p2: PostRecord = {
  title: "Artifice",
  body: stringToSlateNode("Body foo"),
  authorId: u1.uid,
  updatedAt: new Date(),
  id: "123",
  mentions: [],
};

export const posts0: PostRecord[] = [p0];

/**
 * Docs
 */

export const doc0 = [
  {
    children: [
      {
        type: "p",
        children: [{ text: "paragraph 1" }],
      },
      {
        type: "p",
        children: [{ text: "paragraph 2" }],
      },
      {
        type: "p",
        children: [{ text: "paragraph 3" }],
      },
    ],
  },
];

export const doc1 = [
  {
    children: [
      {
        type: "p",
        children: [
          { text: "As I was saying in " },
          {
            type: "mention",
            value: "Hey!",
            exists: true,
            authorUsername: "l4stewar",
            children: [{ text: "" }],
            authorId: "7WSdaWnlfEbBszRiQxuL1zs1vZq2",
            postId: "iVZbiDaFC9RGOBvX9PGB",
          },
          { text: " Mango is goooooood." },
        ],
      },
      {
        type: "ul",
        children: [
          {
            children: [{ type: "p", children: [{ text: "here we gooooooo" }] }],
            type: "li",
          },
          {
            type: "li",
            children: [
              {
                children: [
                  { text: "heere we " },
                  {
                    postId: "d45fc801-2438-4dd7-829b-300da4994f0e",
                    authorUsername: "l4stewar",
                    exists: false,
                    value: "Go",
                    authorId: "7WSdaWnlfEbBszRiQxuL1zs1vZq2",
                    children: [{ text: "" }],
                    type: "mention",
                  },
                  { text: "" },
                ],
                type: "p",
              },
            ],
          },
        ],
      },
      { children: [{ text: "adsadasdasdas" }], type: "p" },
      { children: [{ text: "New Section!" }], type: "h5" },
      {
        type: "p",
        children: [
          { text: "he", bold: true },
          { bold: true, text: "he", italic: true },
          { text: "hehehe", bold: true },
        ],
      },
      {
        type: "p",
        children: [
          { text: "mentioning Nim's " },
          {
            authorUsername: "nybbles",
            value: "Mango",
            postId: "xXpouaBQ0tEUANtwFcg2",
            authorId: "ArX0xuTOidSNHzbMTd5IRK0nqgb2",
            exists: true,
            children: [{ text: "" }],
            type: "mention",
          },
          { text: " post" },
        ],
      },
      {
        type: "p",
        children: [
          { text: "" },
          {
            authorUsername: "nybbles",
            authorId: "ArX0xuTOidSNHzbMTd5IRK0nqgb2",
            exists: true,
            value: "Mango",
            children: [{ text: "" }],
            type: "mention",
            postId: "xXpouaBQ0tEUANtwFcg2",
          },
          { text: "" },
        ],
      },
      {
        children: [
          { text: "" },
          {
            exists: true,
            postId: "b73b398d-1cfe-468a-9f88-a911532a52ac",
            value: "Mango",
            children: [{ text: "" }],
            type: "mention",
            authorId: "7WSdaWnlfEbBszRiQxuL1zs1vZq2",
            authorUsername: "l4stewar",
          },
          { text: "" },
        ],
        type: "p",
      },
    ],
  },
];

/**
 * UserPosts
 */

export const up0 = {
  user: u0,
  post: p0,
};

export const up1 = {
  user: u0,
  post: p1,
};

export const up2 = {
  user: u1,
  post: p2,
};

// 2 posts, 1 user, same post titles
export const userPosts0: UserPost[] = [up0, up1];

// 2 posts, 2 users, diff post titles
export const userPosts1: UserPost[] = [up0, up2];

// Single post with a mention
export const userPosts2: UserPost[] = [
  {
    user: u1,
    post: {
      title: "Artifice",
      body: doc1,
      authorId: u1.uid,
      updatedAt: new Date(),
      id: "123",
      mentions: [],
    },
  },
];

/**
 * Auth
 */

export const authProvider: AuthProvider = {
  onAuthStateChanged: (authState) => {},
  getInitialAuthState: () => ({
    uid: "123",
    displayName: "Test user",
    username: "foo",
  }),
};
