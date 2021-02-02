import firebase from "firebase";
import * as log from "loglevel";

// TODO: Eventually, once this package is part of yarn workspaces, this
// definition should be shared between functions and village-web.
export type TwitterUser = {
  id: string;
  name: string;
  username: string;
};

export type TwitterUserFound = {
  state: "found";
  user: TwitterUser;
};

export type TwitterUserNotFound = {
  state: "not-found";
};

export type TwitterUserLookupResult = TwitterUserFound | TwitterUserNotFound;

export type LookupTwitterUserFn = (
  id: string
) => Promise<TwitterUserLookupResult>;

export const buildLookupTwitterUser = (
  functions: firebase.functions.Functions
): LookupTwitterUserFn => {
  const logger = log.getLogger("lookupTwitterUser");
  const lookupTwitterUser = functions.httpsCallable("lookupTwitterUser");
  return async (id) => {
    try {
      const result = await lookupTwitterUser({ id: id });
      return {
        state: "found",
        user: result.data as TwitterUser,
      };
    } catch (error) {
      const { code, message } = error;
      if (!code) {
        // this is not a HttpsError, so rethrow
        throw error;
      }
      switch (code) {
        case "not-found":
          return {
            state: "not-found",
          };
        default:
          logger.error(`HttpsError: ${message}`);
          throw error;
      }
    }
  };
};
