import argparse
import logging
from newspaper import Article
import json
import os
from urllib.parse import urlparse
import re
import nltk


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--dest", type=str, required=True)
  parser.add_argument("--url", type=str, required=False)
  parser.add_argument("--bookmark-id", type=str, required=False)
  parser.add_argument("--ignore-cache", action='store_true')

  nltk.download('punkt')

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger("fetch")
  logger.debug("starting...")

  url = args.url
  if args.bookmark_id:
    with open(os.path.join(args.dest, args.bookmark_id, "bookmark.json")) as bookmark_file:
      bookmark_doc = json.load(bookmark_file)
      url = bookmark_doc["url"]

  if url is None:
    raise Exception("Invalid url")

  article = Article(url)
  article.download()
  article.parse()

  logger.debug(
    f"fetched {url}; text={article.text[0:64].strip()}...")

  article.nlp()

  logger.debug(
    f"entities: {article.keywords}")

  article_parsed_url = urlparse(url)
  url_path_part = article_parsed_url.hostname + '_' + article_parsed_url.path
  url_path_part = re.sub(r'[/:.\-_]+', '_', url_path_part).strip("_")

  article_doc = {
    "id": url_path_part,
    "url": article.url,
    "text": article.text,
    "html": article.html,
    "keywords": article.keywords,
  }

  article_dirname = os.path.join(args.dest, url_path_part)
  os.makedirs(article_dirname, exist_ok=True)
  article_filename = os.path.join(article_dirname, "article_parts.json")
  logger.debug(f"writing to {article_filename}")
  with open(article_filename, 'w') as article_file:
    json.dump(article_doc, article_file)


main()
