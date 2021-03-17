import { useWhitelistedUserFromAppAuthContext } from "../../services/auth/AppAuth";
import { UserId } from "../../services/store/Users";

export const useIsLoggedInAsAuthor = (postAuthorId: UserId) => {
  const whitelistedUser = useWhitelistedUserFromAppAuthContext();
  const isLoggedInAsAuthor = !!whitelistedUser
    ? postAuthorId === whitelistedUser.uid
    : false;

  return isLoggedInAsAuthor;
};
