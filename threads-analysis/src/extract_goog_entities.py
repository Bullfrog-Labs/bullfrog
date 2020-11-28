import argparse
import logging
import json
import os
from urllib.parse import urlparse
import re
import spacy
from google.cloud import language_v1
from google.protobuf.json_format import MessageToDict


def save_entities(entities_doc, base_dir, article_id):
  article_dirname = os.path.join(base_dir, article_id)
  entities_filename = os.path.join(article_dirname, "google_entities.json")
  with open(entities_filename, 'w') as entities_file:
    json.dump(entities_doc, entities_file)


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--dest", type=str, required=True)
  parser.add_argument("--article-doc", type=str, required=True)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger()
  logger.debug("starting...")

  article_doc = json.loads(open(args.article_doc).read())
  logger.debug(f"loaded article doc {article_doc['id']}")

  article_text = article_doc["text"]
  article_text = re.sub('[,\.!?]', ' ', article_text)
  article_text = article_text.lower()
  if article_text is None:
    raise Exception("missing text for doc, aborting")

  logger.debug(f"running google nlp...")
  client = language_v1.LanguageServiceClient()
  document = {"content": article_text,
              "type_": language_v1.Document.Type.PLAIN_TEXT}

  response = client.analyze_entities(request={'document': document})
  logger.debug(f"ents: num={len(response.entities)}")

  for e in response.entities:
    print(f"{e.name}\t{language_v1.Entity.Type(e.type_).name}\t{e.salience}")

  entities = [{
    "name": e.name,
    "type": language_v1.Entity.Type(e.type_).name,
    "salience": e.salience
  } for e in response.entities]

  entities_doc = {
    "bullfrog_id": article_doc['id'],
    "entities": entities
  }

  logger.debug(f"finished")

  logger.debug(f"writing entities...")
  save_entities(entities_doc, args.dest, article_doc["id"])
  logger.debug(f"done")


main()
