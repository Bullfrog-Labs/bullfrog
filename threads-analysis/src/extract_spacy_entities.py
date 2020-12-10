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
import sys
import asyncio

timers = {}


def log_timers(timers):
  logger = logging.getLogger("extract_entities")
  for metric_name in dict(filter(lambda t: t[0].startswith("elapsed"), timers.items())):
    elapsed_ms = timers[metric_name]
    logger.debug(f"{metric_name} = {elapsed_ms}s")


def save_entities(entities_doc, base_dir, article_id):
  article_dirname = os.path.join(base_dir, article_id)
  entities_filename = os.path.join(article_dirname, "spacy_entities.json")
  with open(entities_filename, 'w') as entities_file:
    json.dump(entities_doc, entities_file)


async def extract_and_save(article_doc_filename, nlp, base_dir):
  logger = logging.getLogger("extract_entities")
  article_doc = json.loads(open(article_doc_filename).read())
  article_id = article_doc["id"]

  logger.debug(f"loaded article doc {article_id}")

  article_text = article_doc["text"]
  if article_text is None:
    raise Exception("missing text for doc, aborting")

  doc = nlp(article_text)

  doc_data_str = str(base64.b64encode(doc.to_bytes()), 'UTF-8')

  entities_doc = {
    "bullfrog_id": article_id,
    "spacy_doc": doc_data_str,
  }

  save_entities(entities_doc, base_dir, article_id)


async def extract_and_save_all(nlp, base_dir):
  logger = logging.getLogger("extract_entities")
  source_ids = os.listdir(base_dir)
  logger.debug(f"ids={source_ids}")

  futures = []
  for source_id in source_ids[0:5]:
    article_doc = f"data/sources/{source_id}/article_parts.json"
    futures.append(extract_and_save(article_doc, nlp, base_dir))
  asyncio.gather(*futures)


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

  asyncio.run(extract_and_save_all(nlp, args.dest))

  logger.debug(f"done")
  log_timers(timers)


main()
