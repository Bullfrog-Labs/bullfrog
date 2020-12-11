import pandas as pd
import logging
from sklearn.feature_extraction.text import (
    CountVectorizer, TfidfVectorizer, TfidfTransformer
)
import os
import json
import numpy as np
import argparse


def process_with_transformer(df):

  cv = CountVectorizer()
  word_count_vector = cv.fit_transform(df["text"])
  print(word_count_vector.shape)

  tfidf_transformer = TfidfTransformer(smooth_idf=True, use_idf=True)
  tfidf_transformer.fit(word_count_vector)
  df_idf = pd.DataFrame(tfidf_transformer.idf_,
                        index=cv.get_feature_names(), columns=["idf_weights"])
  df_idf.sort_values(by=['idf_weights'])
  # print(df_idf.tail(20))

  count_vector = cv.transform(df["text"])
  tf_idf_vector = tfidf_transformer.transform(count_vector)
  feature_names = cv.get_feature_names()
  print(f"num features={len(feature_names)}")

  doc_id = 3
  vector_0 = tf_idf_vector[doc_id]
  df_0 = pd.DataFrame(vector_0.T.todense(),
                      index=feature_names, columns=["tfidf"])
  df_0 = df_0.sort_values(by=["tfidf"], ascending=False)
  print(f"first doc {df.loc[doc_id]}")
  print(df_0.head(20))


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--source-ids", type=str)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger()

  source_ids = os.listdir("data/sources")
  if args.source_ids:
    source_ids = args.source_ids.split(",")

  source_docs = []
  for source_id in source_ids:
    source_filename = os.path.join(
      "data/sources", source_id, "article_parts.json")
    if not os.path.exists(source_filename):
      continue
    with open(source_filename, 'r') as source_file:
      source_doc = json.load(source_file)
      source_docs.append(source_doc)
  df = pd.DataFrame(source_docs)
  corpus = df["text"]
  pids = df["id"]
  print(df.columns)

  # process_with_transformer(df)

  max_features = 5000
  v = TfidfVectorizer(input='content',
                      encoding='utf-8', decode_error='replace', strip_accents='unicode',
                      lowercase=True, analyzer='word', stop_words='english',
                      token_pattern=r'(?u)\b[a-zA-Z_][a-zA-Z0-9_]+\b',
                      ngram_range=(1, 2), max_features=max_features,
                      norm='l2', use_idf=True, smooth_idf=True, sublinear_tf=True,
                      max_df=1.0, min_df=1)
  v.fit(corpus)
  X = v.transform(corpus)
  print(v.vocabulary_)

  X = X.todense()  # originally it's a sparse matrix

  X0sort = np.argsort(X[0], axis=1)
  print(X0sort)
  print(X[0, 2051])

  vocab = {}
  for k, v in v.vocabulary_.items():
    vocab[v] = str(k)

  print(vocab)

  for i in np.nditer(X0sort):
    print(f"{i}\t{vocab[int(i)]}\t{X[0,i]}")

  # for k in sorted(v.vocabulary_.keys()):
  # print(k)
  print(X.shape)

  sim_dict = {}
  batch_size = 200
  top_n_recs = []
  for i in range(0, len(pids), batch_size):
    i1 = min(len(pids), i + batch_size)
    xquery = X[i: i1]  # BxD
    ds = -np.asarray(np.dot(X, xquery.T))  # NxD * DxB => NxB
    # print(ds)
    IX = np.argsort(ds, axis=0)  # NxB
    for j in range(i1 - i):
      sim_dict[pids[i + j]] = [pids[q] for q in list(IX[:5, j])]
      top_n_recs.append({"id": pids[i + j], "top_n": sim_dict[pids[i + j]]})
    print('%d/%d...' % (i, len(pids)))

  df_top_n = pd.DataFrame(top_n_recs)
  print(df_top_n)

  crypto_ids = "www_theblockcrypto_com_daily_76525_hayden_adams_uniswap_interview,www_parallele_at,thedefiant_substack_com_p_sushiswaps_vampire_scheme_hours_away,defipulse_com,1inch_exchange,cointelegraph_com_news_the_irs_offers_a_625_000_bounty_to_anyone_who_can_break_monero_and_lightning,sepia_substack_com_p_on_the_namespace_economy,medium_com_@SomerEsat_guide_to_staking_on_ethereum_2_0_ubuntu_medalla_nimbus_5f4b2b0f2d7c,uniswap_org_blog_uni,amentum_substack_com_p_the_decentralized_web,www_wired_com_story_operation_disruptor_179_arrested_global_dark_web_takedown,www_coindesk_com_the_standard_about_to_revolutionize_payments".split(
    ",")

  df_top_n[df_top_n["id"].isin(crypto_ids)].to_csv(
    "data/tfidf_sept_crypto.csv", index=False, sep="\t")

  df_top_n.to_csv("data/tfidf_sept.csv", index=False, sep="\t")

  # print(sim_dict['eloquentjavascript_net'])


main()
