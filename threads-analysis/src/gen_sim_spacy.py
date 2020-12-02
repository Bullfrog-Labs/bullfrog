import argparse
import logging
import json
import os
import spacy
from spacy.tokens import Doc
import base64
import time

timers = {}


def log_timers(timers):
  logger = logging.getLogger("gen_sim_spacy")
  for metric_name in dict(filter(lambda t: t[0].startswith("elapsed"), timers.items())):
    elapsed_ms = timers[metric_name]
    logger.debug(f"{metric_name} = {elapsed_ms}s")


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

  timers["start_load_files_ms"] = time.time()
  doc_a = json.loads(open(args.entity_doc_a).read())
  doc_a_id = doc_a['bullfrog_id']
  logger.debug(f"loaded entity doc a {doc_a_id}")
  doc_b = json.loads(open(args.entity_doc_b).read())
  doc_b_id = doc_b['bullfrog_id']
  logger.debug(f"loaded entity doc b {doc_b_id}")
  timers["elapsed_load_files_ms"] = time.time() - timers["start_load_files_ms"]

  timers["start_load_model_ms"] = time.time()
  nlp = spacy.load("en_core_web_md")
  timers["elapsed_load_model_ms"] = time.time() - timers["start_load_model_ms"]

  timers["start_decode_ms"] = time.time()
  b64_doc_a = doc_a["spacy_doc"]
  bytes_doc_a = base64.b64decode(b64_doc_a.encode())
  b64_doc_b = doc_b["spacy_doc"]
  bytes_doc_b = base64.b64decode(b64_doc_b.encode())
  timers["elapsed_decode_ms"] = time.time() - timers["start_decode_ms"]

  timers["start_doc_load_ms"] = time.time()
  doc_loader_a = Doc(nlp.vocab)
  spacy_doc_a = doc_loader_a.from_bytes(bytes_doc_a)
  logger.debug(len(bytes_doc_b))
  doc_loader_b = Doc(nlp.vocab)
  spacy_doc_b = doc_loader_b.from_bytes(bytes_doc_b)
  timers["elapsed_doc_load_ms"] = time.time() - timers["start_doc_load_ms"]

  timers["start_sim_ms"] = time.time()
  similarity = spacy_doc_a.similarity(spacy_doc_b)
  logger.debug(f"similarity={similarity}")
  timers["elapsed_sim_ms"] = time.time() - timers["start_sim_ms"]

  sim_spacy_id = f"{doc_a_id}-{doc_b_id}"

  sim_spacy_doc = {
    "id": sim_spacy_id,
    "similarity": similarity,
  }

  sim_spacy_dirname = os.path.join(args.data_dir, "sim_spacy")
  os.makedirs(sim_spacy_dirname, exist_ok=True)
  similarity_filename = os.path.join(
    sim_spacy_dirname, f"{sim_spacy_id}.json")
  logger.debug(f"writing to {similarity_filename}")
  with open(similarity_filename, 'w') as similarity_file:
    json.dump(sim_spacy_doc, similarity_file)

  log_timers(timers)


main()
