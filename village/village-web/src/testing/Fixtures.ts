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
export const u1: UserRecord = Object.assign({}, u0, { uid: "124" });

export const p0: PostRecord = {
  title: "Title mane",
  body: stringToSlateNode("Body foo"),
  authorId: "123",
  updatedAt: new Date(),
  id: "123",
};
export const p1: PostRecord = Object.assign({}, p0, { id: "124" });

export const posts0: PostRecord[] = [p0];

export const up0 = {
  user: u0,
  post: p0,
};

export const up1 = {
  user: u1,
  post: p1,
};

export const userPosts0: UserPost[] = [up0, up1];

export const authProvider: AuthProvider = {
  onAuthStateChanged: (authState) => {},
  getInitialAuthState: () => ({
    displayName: "Test user",
    email: "testuser@somewhere.com",
  }),
};
