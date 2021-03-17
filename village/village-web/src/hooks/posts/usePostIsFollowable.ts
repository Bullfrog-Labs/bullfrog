import { useIsLoggedIn } from "../../services/auth/AppAuth";
import { UserId } from "../../services/store/Users";
import { useIsLoggedInAsAuthor } from "./useIsLoggedInAsAuthor";

export const usePostIsFollowable = (postAuthorId: UserId) => {
  const isLoggedInAsAuthor = useIsLoggedInAsAuthor(postAuthorId);
  return useIsLoggedIn() && !isLoggedInAsAuthor;
};
