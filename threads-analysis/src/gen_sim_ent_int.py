import argparse
import logging
import json
import os
import pandas as pd


def create_and_filter_df(doc):
  logger = logging.getLogger()
  df = pd.DataFrame(doc["entities"],
                    columns=["name", "type", "salience"])
  df_filt = df[~df.type.isin(["DATE", "ADDRESS", "NUMBER"])]
  if df_filt.shape[0] == 0:
    return df_filt

  df_group = df_filt.groupby(["name"])

  df_group_max = df_group.max()
  percentiles = df_group_max.salience.quantile([0.1, 0.5, 0.8, 0.9, 0.99])
  logger.debug(f"percentiles={percentiles}")
  logger.debug(f"using {percentiles.at[0.80]}")

  df_group_max_top = df_group_max[df_group_max.salience >=
                                  percentiles.at[0.8]]
  logger.debug(f"shape={df_group_max_top.shape}")

  return df_group_max_top


def compute_edge_weight(doc_a, doc_b):
  logger = logging.getLogger()
  df_a = create_and_filter_df(doc_a)
  df_b = create_and_filter_df(doc_b)

  logger.debug(df_a)
  logger.debug(df_b)

  intersection = df_a.index.intersection(df_b.index)
  logger.debug(intersection)

  if intersection.size > 1:
    return [intersection.size, intersection]
  else:
    return [0, []]


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--entities-doc-a", type=str, required=True)
  parser.add_argument("--entities-doc-b", type=str, required=True)
  parser.add_argument("--data-dir", type=str, required=True)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger("gen_sim_ent_int")
  logger.debug("Starting...")

  doc_a = json.loads(open(args.entities_doc_a).read())
  logger.debug(f"loaded entities doc {doc_a['bullfrog_id']}")
  doc_b = json.loads(open(args.entities_doc_b).read())
  logger.debug(f"loaded entities doc {doc_b['bullfrog_id']}")

  [weight, intersection] = compute_edge_weight(doc_a, doc_b)

  if weight == 0:
    return

  sim_ent_int_id = f"{doc_a['bullfrog_id']}-{doc_b['bullfrog_id']}"

  sim_ent_int_doc = {
    "id": sim_ent_int_id,
    "intersection": intersection,
    "similarity": weight,
  }

  sim_ent_int_dirname = os.path.join(args.data_dir, "sim_ent_int")
  os.makedirs(sim_ent_int_dirname, exist_ok=True)
  similarity_filename = os.path.join(
    sim_ent_int_dirname, f"{sim_ent_int_id}.json")
  logger.debug(f"writing to {similarity_filename}")
  with open(similarity_filename, 'w') as similarity_file:
    json.dump(sim_ent_int_doc, similarity_file)


main()
