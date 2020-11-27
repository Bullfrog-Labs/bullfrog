import argparse
import logging
import json
import os
from urllib.parse import urlparse
import re
import spacy


def save_entities(entities_doc, base_dir, article_id):
  article_dirname = os.path.join(base_dir, article_id)
  entities_filename = os.path.join(article_dirname, "spacy_entities.json")
  with open(entities_filename, 'w') as entities_file:
    json.dump(entities_doc, entities_file)


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--dest", type=str, required=True)
  parser.add_argument("--article-doc", type=str, required=True)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger("extract_entities")
  logger.debug("starting...")

  # need to run this first: python3 -m spacy download en_core_web_sm
  nlp = spacy.load("en_core_web_sm")

  article_doc = json.loads(open(args.article_doc).read())

  logger.debug(f"loaded article doc {article_doc['id']}")

  article_text = article_doc["text"]
  if article_text is None:
    raise Exception("missing text for doc, aborting")

  doc = nlp(article_text)
  logger.debug(f"got ents; num={len(doc.ents)}")
  for ent in doc.ents:
    print(f"{ent.label_} | {ent.text}".strip())

  entities_doc = doc.to_json()

  logger.debug(f"writing entities")
  save_entities(entities_doc, args.dest, article_doc["id"])
  logger.debug(f"done")


main()
