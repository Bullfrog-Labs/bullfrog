import argparse
import logging
import json
import os
from graphviz import Digraph
from datetime import datetime
import pandas as pd

# datetime.fromisoformat(bookmark_doc["saved_date"])


def create_and_filter_df(doc):
  logger = logging.getLogger()
  df = pd.DataFrame(doc["entities"]["entities"],
                    columns=["name", "type", "salience"])
  df_filt = df[~df.type.isin(["DATE", "ADDRESS", "NUMBER"])]
  df_group = df_filt.groupby(["name"])

  df_group_max = df_group.max()
  logger.debug(
    f"percentiles={df_group_max.salience.quantile([0.1, 0.5, 0.8, 0.9, 0.99])}")

  df_group_max_top = df_group_max[df_group_max.salience >= 0.0025]
  logger.debug(f"shape={df_group_max_top.shape}")

  return df_group_max_top


def compute_edge_weight(doc_a, doc_b):
  logger = logging.getLogger()
  if doc_a == doc_b:
    return 0
  date_a = datetime.fromisoformat(doc_a["bookmark"]["saved_date"])
  date_b = datetime.fromisoformat(doc_b["bookmark"]["saved_date"])
  if date_a > date_b:
    return 0
  df_a = create_and_filter_df(doc_a)
  df_b = create_and_filter_df(doc_b)

  intersection = df_a.index.intersection(df_b.index)
  logger.debug(intersection)

  if intersection.size > 1:
    return intersection.size
  else:
    return 0


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--data-dir", type=str, required=True)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger()
  logger.debug("starting...")

  data_dir = args.data_dir
  sources = os.listdir(data_dir)
  logger.debug(f"got dirs {sources}")
  source_docs = []

  for source in sources[0:100]:
    logger.debug(f"loading {data_dir}/{source}")

    entities_filename = os.path.join(data_dir, source, "google_entities.json")
    bookmark_filename = os.path.join(data_dir, source, "bookmark.json")

    if not os.path.exists(entities_filename) or not os.path.exists(bookmark_filename):
      continue

    with open(entities_filename) as entities_file:
      entities_doc = json.load(entities_file)

    with open(bookmark_filename) as bookmark_file:
      bookmark_doc = json.load(bookmark_file)

    source_doc = {
      "source_id": source,
      "bookmark": bookmark_doc,
      "entities": entities_doc
    }

    source_docs.append(source_doc)

  # need to install graphiz first, brew install graphviz
  graph = Digraph('G', filename='data/topic_graph.gv')

  for doc_a in source_docs:
    for doc_b in source_docs:
      weight = compute_edge_weight(doc_a, doc_b)
      if weight > 0:
        graph.edge(doc_a["source_id"], doc_b["source_id"], label=f"{weight}")

  graph.view()


main()
