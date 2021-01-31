import * as functions from "firebase-functions";
import { lookupTwitterUserById } from "./Twitter";

export const lookupTwitterUser = functions.https.onRequest(
  async (
    request: functions.https.Request,
    response: functions.Response<any>
  ) => {
    const uid = request.query.id as string | undefined;
    if (!uid) {
      throw new Error("uid not provided in query");
    }
    const result = await lookupTwitterUserById(uid!);
    response.json(result);
  }
);
