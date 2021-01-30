import axios from "axios";
import * as log from "loglevel";

export type TwitterUser = {
  id: string;
  name: string;
  username: string;
};

// see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id

export const lookupTwitterUserById = async (
  uid: string
): Promise<TwitterUser | undefined> => {
  const logger = log.getLogger("lookupTwitterUserById");
  try {
    const rep = await axios.get(`https://api.twitter.com/2/users/${uid}`, {
      headers: { Authorization: `Bearer ${process.env.BRR_TOKEN}` },
    });
    if (rep.status === 200) {
      return {
        id: rep.data.id,
        name: rep.data.name,
        username: rep.data.username,
      };
    } else {
      logger.warn(
        `Request failed; status=${rep.status}, msg=${rep.statusText}`
      );
      return undefined;
    }
  } catch (e) {
    logger.error(`Error in fetch ${e}`);
    return undefined;
  }
};

export type LookupTwitterUserByIdFn = typeof lookupTwitterUserById;
