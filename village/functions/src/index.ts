import * as functions from "firebase-functions";
import { lookupTwitterUserById } from "./Twitter";

export const lookupTwitterUser = functions.https.onCall(
  async (data, context) => {
    const id = data.id as string;

    if (!id) {
      throw new Error("id not provided in query");
    }

    if (!context.auth) {
      throw new Error("auth should not be null");
    }

    const result = await lookupTwitterUserById(id!);
    return result;
  }
);
