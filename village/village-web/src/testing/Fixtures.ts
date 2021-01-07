import { UserPost, PostRecord } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";
import { AuthProvider } from "../services/auth/Auth";
import { stringToSlateNode } from "../components/richtext/Utils";

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

export const p0: PostRecord = {
  title: "Title mane",
  body: stringToSlateNode("Body foo"),
  authorId: "123",
  updatedAt: new Date(),
  id: "123",
};
export const p1: PostRecord = Object.assign({}, p0, { id: "124" });
export const p2: PostRecord = {
  title: "Artifice",
  body: stringToSlateNode("Body foo"),
  authorId: u1.uid,
  updatedAt: new Date(),
  id: "123",
};

export const posts0: PostRecord[] = [p0];

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

export const authProvider: AuthProvider = {
  onAuthStateChanged: (authState) => {},
  getInitialAuthState: () => ({
    displayName: "Test user",
    email: "testuser@somewhere.com",
  }),
};
