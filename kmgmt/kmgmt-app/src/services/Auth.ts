export type AuthState = any;
export type OnAuthStateChangedHandle = (authState: AuthState) => void;

export interface AuthProvider {
  onAuthStateChanged: OnAuthStateChangedHandle;
  getInitialAuthState(): AuthState;
}
