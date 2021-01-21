import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

type RecordExistenceUnknown = "unknown";
type RecordExistenceKnown = "exists" | "does-not-exist";
export type RecordExistence = RecordExistenceUnknown | RecordExistenceKnown;

export interface LoadableRecord<R> {
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

// Fix this shit
// 2. make it easy to write a callback function that operates on LoadableRecords.
// 3. LoadableRecords have a method to set record and recordExistence.

type LoadableRecordSetter<R> = (
  record: R | null,
  existence: RecordExistence
) => void;

export const useLoadableRecord = <R extends unknown>(): [
  LoadableRecord<R>,
  LoadableRecordSetter<R>
] => {
  type MaybeR = R | null;
  const [recordExists, setRecordExists] = useState<RecordExistence>("unknown");
  const [record, setRecord] = useState<MaybeR>(null);

  const loadableRecord = useMemo(
    () => ({
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
    }),
    [record, recordExists]
  );

  const setLoadableRecord = useCallback((record, existence) => {
    setRecordExists(existence);
    setRecord(record);
  }, []);

  return [loadableRecord, setLoadableRecord];
};
