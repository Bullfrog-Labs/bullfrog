import { AppAuthContext } from "../services/auth/AppAuth";
import { AuthProviderState, AuthProvider } from "../services/auth/Auth";

interface AuthedTestUserContextProps extends React.PropsWithChildren<{}> {
  user: AuthProviderState;
}

export const AuthedTestUserContext = (props: AuthedTestUserContextProps) => {
  const { user } = props;

  const authProvider: AuthProvider = {
    onAuthStateChanged: (authState) => {},
    getInitialAuthProviderState: () => user,
  };

  const appAuthState = {
    authCompleted: true,
    authProviderState: authProvider.getInitialAuthProviderState(),
    authedUser: user,
  };

  return (
    <AppAuthContext.Provider value={appAuthState}>
      {props.children}
    </AppAuthContext.Provider>
  );
};
