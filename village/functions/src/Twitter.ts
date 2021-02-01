import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/lib/providers/https";
import Twitter from "twitter-v2";

const credentials = {
  consumer_key: functions.config().twitter.key,
  consumer_secret: functions.config().twitter.secret,
  bearer_token: functions.config().twitter.bearer_token,
};
const client = new Twitter(credentials);

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

// TODO: Eventually, once this package is part of yarn workspaces, this
// definition should be shared between functions and village-web.

export type TwitterUser = {
  id: string;
  name: string;
  username: string;
};

// see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
export const lookupTwitterUserById = async (
  uid: string
): Promise<TwitterUser> => {
  try {
    const response: TwitterResponse = await client.get(`users/${uid}`);
    if (!!response.data) {
      return response.data!;
    } else if (
      !!response.errors &&
      response.errors.length === 1 &&
      response.errors[0].type === RESOURCE_NOT_FOUND_ERROR_TYPE
    ) {
      throw new HttpsError("not-found", "User was not found");
    } else {
      throw new HttpsError("unknown", `API errors in fetch`, response.errors);
    }
  } catch (e) {
    throw new HttpsError("unknown", `Unknown error in fetch`);
  }
};

export type LookupTwitterUserByIdFn = typeof lookupTwitterUserById;
