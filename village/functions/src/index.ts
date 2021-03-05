import * as functions from "firebase-functions";
import { lookupTwitterUserById } from "./Twitter";
import fs from "fs";
import express from "express";

const prerender = require("prerender-node");

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

prerender.set("prerenderToken", "Jn7KZQLHcmqfEkDMvY0l");
const app = express();
app.use((req: any, res: any, next: any) => {
  console.log(`before`);
  next();
});
app.use(prerender);
app.use((req: any, res: any, next: any) => {
  console.log(`after`);
  next();
});
app.get("*", (req, res) => {
  res.status(200).send(fs.readFileSync("./www/index.html").toString());
});

export const proxy = functions.https.onRequest(app);
