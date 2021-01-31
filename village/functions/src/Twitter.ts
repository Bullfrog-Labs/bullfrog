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
    const rep = await axios.get(`https://api.twitter.com/2/users/${uid}`, {
      headers: { Authorization: `Bearer ${process.env.BRR_TOKEN}` },
    });
    if (rep.status === 200) {
      return {
        state: "found",
        user: {
          id: rep.data.id,
          name: rep.data.name,
          username: rep.data.username,
        },
      };
      // TODO: How to handle not found?
    } else {
      throw new Error(
        `Request failed; status=${rep.status}, msg=${rep.statusText}`
      );
    }
  } catch (e) {
    throw new Error(`Error in fetch ${e}`);
  }
};

export type LookupTwitterUserByIdFn = typeof lookupTwitterUserById;
