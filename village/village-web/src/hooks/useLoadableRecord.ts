import { useCallback, useMemo, useState } from "react";

type RecordExistenceUnknown = "unknown";
type RecordExistenceKnown = "exists" | "does-not-exist";
export type RecordExistence = RecordExistenceUnknown | RecordExistenceKnown;

export interface LoadableRecord<R> {
  state: LoadableRecordState<R>;

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

export type LoadableRecordSetter<R> = (
  record: R | null,
  existence: RecordExistence
) => void;

type LoadableRecordState<R> = {
  record: R | null;
  existence: RecordExistence;
};

export const useLoadableRecord = <R extends unknown>(): [
  LoadableRecord<R>,
  LoadableRecordSetter<R>
] => {
  const [state, setState] = useState<LoadableRecordState<R>>({
    existence: "unknown",
    record: null,
  });

  const loadableRecord = useMemo(
    () => ({
      state: state,
      loaded: () => state.existence !== "unknown",
      exists: () => {
        if (state.existence === "unknown") {
          throw new Error("LoadableRecord.exists called before record loaded");
        }
        return state.existence === "exists";
      },
      get: () => {
        if (state.existence !== "exists") {
          throw new Error(
            "LoadableRecord.get called before record loaded or for non-existent record"
          );
        }

        return state.record!;
      },
    }),
    [state]
  );

  const setLoadableRecord = useCallback(
    (record, existence) => {
      setState({
        existence: existence,
        record: record,
      });
    },
    [setState]
  );

  return [loadableRecord, setLoadableRecord];
};
