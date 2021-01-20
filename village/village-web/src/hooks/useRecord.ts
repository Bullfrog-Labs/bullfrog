import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

type RecordExistenceUnknown = "unknown";
type RecordExistenceKnown = "exists" | "does-not-exist";
export type RecordExistence = RecordExistenceUnknown | RecordExistenceKnown;

type LoadRecordFn<R> = () => Promise<[R | null, RecordExistenceKnown]>;

interface LoadableRecord<R> {
  existence: RecordExistence;
  record: R | null;

  loaded(): boolean;
  exists(): boolean;
  get(): R;
}

export const useRecord = <R extends unknown>(
  loadRecord: LoadRecordFn<R>
): LoadableRecord<R> => {
  type MaybeR = R | null;
  const [recordExists, setRecordExists] = useState<RecordExistence>("unknown");
  const [record, setRecord] = useState<MaybeR>(null);

  useEffect(() => {
    let isSubscribed = true; // used to prevent state updates on unmounted components
    const loadRecordWrapper = async () => {
      const [retrievedRecord, retrievedRecordExists] = await loadRecord();
      if (isSubscribed) {
        setRecord(retrievedRecord);
        setRecordExists(retrievedRecordExists);
      }
    };
    loadRecordWrapper();
    return () => {
      isSubscribed = false;
    };
  }, [loadRecord]);

  return {
    existence: recordExists,
    record: record,
    loaded: () => recordExists !== "unknown",
    exists: () => {
      if (recordExists === "unknown") {
        throw new Error("LoadableRecord.exists called before record loaded");
      }
      return recordExists === "exists";
    },
    get: () => {
      if (recordExists !== "exists") {
        throw new Error(
          "LoadableRecord.get called before record loaded or for non-existent record"
        );
      }

      return record!;
    },
  };
};
