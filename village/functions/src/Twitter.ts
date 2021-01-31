import * as functions from "firebase-functions";
import axios from "axios";

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

// TODO need to read API keys from configuration

export type TwitterUserLookupResult = TwitterUserFound | TwitterUserNotFound;

// see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
export const lookupTwitterUserById = async (
  uid: string
): Promise<TwitterUserLookupResult> => {
  try {
    const response = await axios.get(`https://api.twitter.com/2/users/${uid}`, {
      headers: {
        Authorization: `Bearer ${functions.config().twitter.bearer_token}`,
      },
    });
    switch (response.status) {
      case 200:
        functions.logger.log(response.data);
        const errors = response.data.errors;
        if (!!errors) {
          if (errors)  
        } else {
          const user = response.data.data;
          return {
            state: "found",
            user: user,
          };
        }
      default:
        functions.logger.log(response);
        throw new Error(
          `Request returned unexpected 2xx status; status=${response.status}, msg=${response.statusText}`
        );
    }
  } catch (e) {
    const message = !!e.response
      ? `Error in fetch, status: ${e.response.status}, data: ${e.response.data}`
      : `Error in fetch: ${e}`;
    throw new Error(message);
  }
};

export type LookupTwitterUserByIdFn = typeof lookupTwitterUserById;
