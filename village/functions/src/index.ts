import * as functions from "firebase-functions";
import { lookupTwitterUserById } from "./Twitter";
import express from "express";
import axios from "axios";

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

const fetchIndexHtml = async () => {
  let indexHtml;

  const startTimeMs = Date.now();
  try {
    const rep = await axios.get(`http://village.ink/iandex.html`);
    if (rep.status !== 200) {
      console.log(`Error fetching index.html; status=${rep.status}`);
      indexHtml = undefined;
    } else {
      indexHtml = rep.data;
    }
  } catch (e) {
    console.log(`Error fetching index.html; e=${e}`);
    indexHtml = undefined;
  }
  console.log(`Fetch complete; timeMs=${Date.now() - startTimeMs}`);

  return indexHtml;
};

prerender.set("prerenderToken", "Jn7KZQLHcmqfEkDMvY0l");
const app = express();
app.use((req: any, res: any, next: any) => {
  console.log(`Before prerender`);
  next();
});
app.use(prerender);
app.use((req: any, res: any, next: any) => {
  console.log(`After prerender`);
  next();
});
app.get("*", async (req, res) => {
  const indexHtml = await fetchIndexHtml();
  if (indexHtml) {
    res
      .set("Cache-Control", "public, max-age=600")
      .status(200)
      .send(indexHtml.toString());
  } else {
    res.status(500).send();
  }
});

export const proxy = functions.https.onRequest(app);
