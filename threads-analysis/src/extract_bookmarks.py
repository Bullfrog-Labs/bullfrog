import argparse
import logging
import os
import pandas as pd
import json
from urllib.parse import urlparse
import re
from datetime import datetime


def save_file(doc, base_dir, id_part):
  file_dirname = os.path.join(base_dir, id_part)
  os.makedirs(file_dirname, exist_ok=True)
  filename = os.path.join(file_dirname, "bookmark.json")
  with open(filename, 'w') as file:
    json.dump(doc, file, sort_keys=True, indent=2)


def url_to_id(url):
  parsed_url = urlparse(url)
  url_path_part = f"{parsed_url.hostname}_{parsed_url.path}"
  url_path_part = re.sub(r'[/:.\-_]+', '_', url_path_part)
  return url_path_part.strip("_")


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--log-level", type=str, default="INFO")
  parser.add_argument("--data-dir", type=str, required=True)
  parser.add_argument("--instapaper-csv", type=str, required=True)

  args = parser.parse_args()
  logging.basicConfig(level=args.log_level)
  logger = logging.getLogger()

  df = pd.read_csv(args.instapaper_csv)
  df_read = df[df.Folder == "Archive"]
  print(df_read)

  for index, row in df.iterrows():
    url = row["URL"]
    if url is None or url == "":
      continue
    bookmark_id = url_to_id(url)
    bookmark_doc = {
      "bookmark_id": bookmark_id,
      "url": url,
      "title": row["Title"],
      "saved_date": datetime.fromtimestamp(row["Timestamp"]).isoformat(),
    }
    save_file(bookmark_doc, args.data_dir, bookmark_id)


main()
