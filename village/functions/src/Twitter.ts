import * as functions from "firebase-functions";
import Twitter from "twitter-v2";

const credentials = {
  consumer_key: functions.config().twitter.key,
  consumer_secret: functions.config().twitter.secret,
  bearer_token: functions.config().twitter.bearer_token,
};
const client = new Twitter(credentials);

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

const RESOURCE_NOT_FOUND_ERROR_TYPE =
  "https://api.twitter.com/2/problems/resource-not-found";

type TwitterError = {
  detail: string;
  title: string;
  type: string;
};

type TwitterResponse = {
  data?: TwitterUser;
  errors?: TwitterError[];
};

export type TwitterUserLookupResult = TwitterUserFound | TwitterUserNotFound;

// see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
export const lookupTwitterUserById = async (
  uid: string
): Promise<TwitterUserLookupResult> => {
  try {
    const response: TwitterResponse = await client.get(`users/${uid}`);
    if (!!response.data) {
      return {
        state: "found",
        user: response.data,
      };
    } else if (
      !!response.errors &&
      response.errors.length === 1 &&
      response.errors[0].type === RESOURCE_NOT_FOUND_ERROR_TYPE
    ) {
      return {
        state: "not-found",
      };
    } else {
      throw new Error(`API errors in fetch: ${response.errors} `);
    }
  } catch (e) {
    throw new Error(`Error in fetch: ${e}`);
  }
};

export type LookupTwitterUserByIdFn = typeof lookupTwitterUserById;
