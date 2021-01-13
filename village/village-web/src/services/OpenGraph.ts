import axios from "axios";
import * as log from "loglevel";

export const fetchTitleFromOpenGraph = async (
  url: string
): Promise<string | undefined> => {
  const logger = log.getLogger("AutocompleteSearchBox");
  const encodedUri = encodeURIComponent(url);
  const rep = await axios.get(
    `https://opengraph.io/api/1.1/site/${encodedUri}?app_id=c4bf9937-cc07-45d0-b3ec-549bab92dc39`
  );
  if (rep.status === 200) {
    const data = rep.data;
    const title =
      data.openGraph.title || data.hybridGraph.title || data.htmlInferred.title;
    if (title) {
      return title;
    } else {
      logger.warn(`Failed to fetch title; response=${rep}`);
      return undefined;
    }
  } else {
    logger.warn(`Request failed; status=${rep.status}, msg=${rep.statusText}`);
    return undefined;
  }
};

export type FetchTitleFromOpenGraphFn = typeof fetchTitleFromOpenGraph;
