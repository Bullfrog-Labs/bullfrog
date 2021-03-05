import * as functions from "firebase-functions";
import express from "express";
import axios from "axios";

const prerender = require("prerender-node");
prerender.set("prerenderToken", "Jn7KZQLHcmqfEkDMvY0l");

const logger = functions.logger;

const fetchIndexHtml = async () => {
  let indexHtml;

  const startTimeMs = Date.now();
  try {
    const rep = await axios.get(`http://village.ink/index.html`);
    if (rep.status !== 200) {
      logger.debug(`Error fetching index.html; status=${rep.status}`);
      indexHtml = undefined;
    } else {
      indexHtml = rep.data;
    }
  } catch (e) {
    logger.debug(`Error fetching index.html; e=${e}`);
    indexHtml = undefined;
  }
  logger.debug(`Fetch complete; timeMs=${Date.now() - startTimeMs}`);

  return indexHtml;
};

export const buildPrerenderProxyApp = () => {
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
  return app;
};
