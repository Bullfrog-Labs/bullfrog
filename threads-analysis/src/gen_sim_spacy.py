import argparse
import logging
import json
import os
import spacy
from spacy.tokens import Doc
import base64
import time
import asyncio

timers = {}


def log_timers(timers):
  logger = logging.getLogger("gen_sim_spacy")
  for metric_name in dict(filter(lambda t: t[0].startswith("elapsed"), timers.items())):
    elapsed_ms = timers[metric_name]
    logger.debug(f"{metric_name} = {elapsed_ms}s")


async def compute_sim(nlp, entity_doc_a, entity_doc_b, data_dir):
  logger = logging.getLogger("gen_sim_spacy")
  doc_a = json.loads(open(entity_doc_a).read())
  doc_a_id = doc_a['bullfrog_id']
  logger.debug(f"loaded entity doc a {doc_a_id}")
  doc_b = json.loads(open(entity_doc_b).read())
  doc_b_id = doc_b['bullfrog_id']
  logger.debug(f"loaded entity doc b {doc_b_id}")

  b64_doc_a = doc_a["spacy_doc"]
  bytes_doc_a = base64.b64decode(b64_doc_a.encode())
  b64_doc_b = doc_b["spacy_doc"]
  bytes_doc_b = base64.b64decode(b64_doc_b.encode())

  doc_loader_a = Doc(nlp.vocab)
  spacy_doc_a = doc_loader_a.from_bytes(bytes_doc_a)
  logger.debug(len(bytes_doc_b))
  doc_loader_b = Doc(nlp.vocab)
  spacy_doc_b = doc_loader_b.from_bytes(bytes_doc_b)

  similarity = spacy_doc_a.similarity(spacy_doc_b)
  logger.debug(f"similarity={similarity}")

  sim_spacy_id = f"{doc_a_id}-{doc_b_id}"

  sim_spacy_doc = {
    "id": sim_spacy_id,
    "similarity": similarity,
  }

  sim_spacy_dirname = os.path.join(data_dir, "sim_spacy")
  os.makedirs(sim_spacy_dirname, exist_ok=True)
  similarity_filename = os.path.join(
      sim_spacy_dirname, f"{sim_spacy_id}.json")
  logger.debug(f"writing to {similarity_filename}")
  with open(similarity_filename, 'w') as similarity_file:
    json.dump(sim_spacy_doc, similarity_file)


async def compute_sim_all(nlp, data_dir):
  logger = logging.getLogger("gen_sim_spacy")
  source_ids = os.listdir(os.path.join(data_dir, "sources"))
  futures = []

  for i in range(len(source_ids)):
    for j in range(i):
      entity_doc_a = f"data/sources/{source_ids[i]}/spacy_entities.json"
      entity_doc_b = f"data/sources/{source_ids[j]}/spacy_entities.json"
      futures.append(compute_sim(nlp, entity_doc_a, entity_doc_b, data_dir))
  asyncio.gather(*futures)


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--entity-doc-a", type=str, required=True)
  parser.add_argument("--entity-doc-b", type=str, required=True)
  parser.add_argument("--data-dir", type=str, required=True)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger("gen_sim_spacy")
  logger.debug("Starting...")

  nlp = spacy.load("en_core_web_lg")
  asyncio.run(compute_sim_all(nlp, args.data_dir))

  logger.debug("Done")

  log_timers(timers)


main()
