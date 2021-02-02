import { AppAuthState } from "../services/auth/AppAuth";
import { UserRecord } from "../services/store/Users";

export const userToAppAuthState = (user: UserRecord): AppAuthState => {
  const authProviderState = {
    uid: user.uid,
    displayName: user.displayName,
    providerData: [],
  };

  const appAuthState = {
    authCompleted: true,
    authProviderState: authProviderState,
    authedUser: {
      uid: user.uid,
      displayName: user.displayName,
      username: user.displayName, // this is done because the auth provider state does not have a user name
    },
    whitelisted: true,
  };

  return appAuthState;
};
