import argparse
import logging
import json
import os
from graphviz import Digraph
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--data-dir", type=str, required=True)
  parser.add_argument("--source-ids", type=str)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger()
  logger.debug("starting...")

  data_dir = args.data_dir
  sources = os.listdir(data_dir)
  if args.source_ids:
    sources = args.source_ids.split(",")
    logger.debug(f"Using {len(sources)} source ids...")

  logger.debug(f"got {len(sources)} dirs")

  sims = os.listdir(os.path.join(data_dir, "../sim_spacy"))

  bookmark_docs = []
  ents_docs = []
  sims_docs = []

  for source in sources:
    bookmark_filename = os.path.join(data_dir, source, "bookmark.json")
    ents_filename = os.path.join(data_dir, source, "google_entities.json")

    if not os.path.exists(bookmark_filename):
      continue
    if not os.path.exists(ents_filename):
      continue
    with open(bookmark_filename) as bookmark_file:
      bookmark_doc = json.load(bookmark_file)
    with open(ents_filename) as ents_file:
      ents_doc = json.load(ents_file)

    bookmark_docs.append(bookmark_doc)
    ents_docs.append(ents_doc)

  for sim_filename in sims:
    sim_path = os.path.join(data_dir, "../sim_spacy", sim_filename)

    if not os.path.exists(sim_path):
      continue
    with open(sim_path) as sims_file:
      sims_doc = json.load(sims_file)

    sims_docs.append(sims_doc)

  df_ents = pd.DataFrame(ents_docs)
  df_ents['ents'] = df_ents['entities'].apply(top_n_ents)
  df_ents = df_ents.drop(columns=['entities'])
  df_bms = process_bms_docs(bookmark_docs)
  df_bms_idx = df_bms.reset_index()
  df_bms_idx = df_bms_idx.set_index('bullfrog_id')
  df_ents_idx = df_ents.reset_index()
  df_ents_idx = df_ents_idx.set_index('bullfrog_id')
  df_all = df_bms_idx.join(df_ents_idx, how="inner")

  df_all = df_all[df_all["ents"].apply(
    lambda x: bool(len(set(["javascript", "browser"]).intersection(x)) != 2))]
  df_all = df_all[df_all["ents"].apply(lambda x: bool(len(x)) != 0)]
  df_all = df_all.sort_values(by="ents", key=lambda x: x.str.len())

  ids = df_all.index.tolist()

  # print(df_all)

  # print(ids)

  df_sims = load_sims(sims_docs)
  df_sims[["left", "right"]] = df_sims["id"].str.split("-", 1, expand=True)
  df_sims = df_sims[df_sims["left"].isin(ids) & df_sims["right"].isin(ids)]
  print(df_sims[["left", "right", "similarity"]].to_csv(
    "data/sim_sept.csv", sep='\t', index=False))

  # print("bms")
  # print(df_bms_idx)
  # print("ents")
  # print(df_ents_idx)
  # print("all")
  # print(df_all)
  df_all.to_csv("data/sept.csv")


def top_n_ents(x):
  df = pd.DataFrame(x, columns=["name", "type", "salience"])
  df = df.sort_values(by=['salience'])
  df = df.tail(10)
  df = df['name'].sort_values()
  return df.tolist()


def load_sims(sims_docs):
  logger = logging.getLogger()
  df = pd.DataFrame(sims_docs)

  df = df.sort_values("similarity")
  df = df[~df["id"].str.startswith(
    "twitter_com") & ~df["id"].str.startswith("t_co")]
  # print(df.tail(20))
  # for sim in df.tail(20)["id"].tolist():
  #  print(sim.split("-"))
  return df


def process_bms_docs(bookmark_docs):
  logger = logging.getLogger()
  df = pd.DataFrame(bookmark_docs)

  df['saved_date'] = pd.to_datetime(df['saved_date'])
  df = df.set_index("saved_date")
  df = df.rename(columns={"bookmark_id": "bullfrog_id"})
  # grouped_df = df.groupby(lambda x: remove_day(x.date))
  # print(grouped_df.count())

  df_sept = df
  df_sept = df_sept.loc['2020-09-01':'2020-10-01']

  # print(df_sept)
  # df_counts = df.resample('1W')['bullfrog_id'].count()
  # df_counts = df_counts.loc['2020-09-01':'2020-10-01']
  # plt.figure()
  # df_counts.plot()
  # plt.show()

  # print(df_sept)

  logger.debug(f"got {len(df_sept)} items")

  return df_sept


main()
