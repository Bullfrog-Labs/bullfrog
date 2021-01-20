import { useEffect, useState } from "react";

type RecordExistenceUnknown = "unknown";
type RecordExistenceKnown = "exists" | "does-not-exist";
export type RecordExistence = RecordExistenceUnknown | RecordExistenceKnown;

export type LoadRecordFn<R> = () => Promise<[R | null, RecordExistence]>;

interface LoadableRecord<R> {
  existence: RecordExistence;
  record: R | null;

  loaded(): boolean;
  exists(): boolean;
  get(): R;
}

export const coalesceMaybeToLoadableRecord = <R extends unknown>(
  result: R | undefined | null
): [R | null, RecordExistenceKnown] => {
  if (!!result) {
    return [result, "exists"];
  } else {
    return [null, "does-not-exist"];
  }
};

export const useLoadableRecord = <R extends unknown>(
  loadRecord: LoadRecordFn<R>,
  name?: string,
  deps?: any[]
): LoadableRecord<R> => {
  type MaybeR = R | null;
  const [recordExists, setRecordExists] = useState<RecordExistence>("unknown");
  const [record, setRecord] = useState<MaybeR>(null);

  useEffect(() => {
    let isSubscribed = true; // used to prevent state updates on unmounted components
    console.log(`${name} subscribing`);
    const loadRecordWrapper = async () => {
      const [retrievedRecord, retrievedRecordExists] = await loadRecord();
      if (isSubscribed) {
        setRecord(retrievedRecord);
        setRecordExists(retrievedRecordExists);
      }
    };
    loadRecordWrapper();
    return () => {
      console.log(`${name} unsubscribing`);
      isSubscribed = false;
    };
  }, deps);

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
