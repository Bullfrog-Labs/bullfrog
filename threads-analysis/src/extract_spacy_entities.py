import argparse
import logging
import json
import os
from urllib.parse import urlparse
import re
import spacy
import time
import base64
from spacy.tokens import Doc


timers = {}


def log_timers(timers):
  for metric_name in dict(filter(lambda t: t[0].startswith("elapsed"), timers.items())):
    elapsed_ms = timers[metric_name]
    logger.debug(f"{metric_name} = {elapsed_ms}s")


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

  timers["start_ms"] = time.time()

  # need to run this first: python3 -m spacy download en_core_web_sm
  timers["start_load_ms"] = time.time()
  nlp = spacy.load("en_core_web_lg")
  timers["elapsed_load_ms"] = time.time() - timers["start_load_ms"]

  timers["start_read_doc_ms"] = time.time()
  article_doc = json.loads(open(args.article_doc).read())
  timers["elapsed_read_doc_ms"] = time.time() - timers["start_read_doc_ms"]

  logger.debug(f"loaded article doc {article_doc['id']}")

  article_text = article_doc["text"]
  if article_text is None:
    raise Exception("missing text for doc, aborting")

  timers["start_nlp_doc_ms"] = time.time()
  doc = nlp(article_text)
  timers["elapsed_nlp_doc_ms"] = time.time() - timers["start_nlp_doc_ms"]

  logger.debug(f"got ents; num={len(doc.ents)}")
  for ent in doc.ents:
    print(f"{ent.label_} | {ent.text}".strip())
  logger.debug(f"tensor={doc.vector}")

  doc_data_str = str(base64.b64encode(doc.to_bytes()), 'UTF-8')

  entities_doc = {
    "bullfrog_id": article_doc['id'],
    "spacy_doc": doc_data_str,
  }

  doc_loader = Doc(nlp.vocab)
  b64_doc_a = entities_doc["spacy_doc"]
  bytes_doc_a = base64.b64decode(b64_doc_a.encode())
  spacy_doc_a = doc_loader.from_bytes(bytes_doc_a)

  logger.debug(f"writing entities")
  timers["start_save_doc_ms"] = time.time()
  save_entities(entities_doc, args.dest, article_doc["id"])
  timers["elapsed_save_doc_ms"] = time.time() - timers["start_save_doc_ms"]
  logger.debug(f"done")
  log_timers(timers)


main()
