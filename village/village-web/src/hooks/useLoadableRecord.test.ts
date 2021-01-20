import * as log from "loglevel";
import { renderHook } from "@testing-library/react-hooks";
import { Logging } from "kmgmt-common";
import {
  coalesceMaybeToLoadableRecord,
  LoadRecordFn,
  useLoadableRecord,
} from "./useLoadableRecord";
import { setTimeout } from "timers";

Logging.configure(log);

test("Loads an existing record", async () => {
  const theAnswer = 42;
  const loadCallback: LoadRecordFn<number | undefined> = async () => [
    theAnswer,
    "exists",
  ];
  const { waitFor, result } = renderHook(() => useLoadableRecord(loadCallback));

  await waitFor(() => {
    expect(result.current.loaded()).toBeTruthy();
    expect(result.current.exists()).toBeTruthy();
    expect(result.current.existence).toEqual("exists");

    expect(result.current.get()).toEqual(theAnswer);
    expect(result.current.record).toEqual(theAnswer);
  });
});

test("Reflects a loaded, but non-existent record", async () => {
  const loadCallback: LoadRecordFn<number | undefined> = async () => [
    undefined,
    "does-not-exist",
  ];
  const { waitFor, result } = renderHook(() => useLoadableRecord(loadCallback));

  await waitFor(() => {
    expect(result.current.loaded()).toBeTruthy();
    expect(result.current.exists()).toBeFalsy();
    expect(result.current.existence).toEqual("does-not-exist");

    expect(() => result.current.get()).toThrowError();
    expect(result.current.record).toBeUndefined();
  });
});

test("Coalescing Maybe works as expected for Exists", async () => {
  const theAnswer = 42;
  const loadCallback: LoadRecordFn<number | undefined> = async () =>
    coalesceMaybeToLoadableRecord(theAnswer);
  const { waitFor, result } = renderHook(() => useLoadableRecord(loadCallback));

  await waitFor(() => {
    expect(result.current.loaded()).toBeTruthy();
    expect(result.current.exists()).toBeTruthy();
    expect(result.current.existence).toEqual("exists");

    expect(result.current.get()).toEqual(theAnswer);
    expect(result.current.record).toEqual(theAnswer);
  });
});

test("Coalescing Maybe works as expected for DNExists", async () => {
  const loadCallback: LoadRecordFn<number | undefined> = async () =>
    coalesceMaybeToLoadableRecord(undefined);
  const { waitFor, result } = renderHook(() => useLoadableRecord(loadCallback));

  await waitFor(() => {
    expect(result.current.loaded()).toBeTruthy();
    expect(result.current.exists()).toBeFalsy();
    expect(result.current.existence).toEqual("does-not-exist");

    expect(() => result.current.get()).toThrowError();
    expect(result.current.record).toBeNull();
  });
});

test("Correctly reflects load/exist state of record", async () => {
  const theAnswer = 42;
  const { waitFor, result } = renderHook(() => {
    const delayedLoadCallback: LoadRecordFn<number> = async () => {
      await new Promise((r) => setTimeout(r, 100));
      return [theAnswer, "exists"];
    };
    return useLoadableRecord(delayedLoadCallback);
  });

  expect(result.current.loaded()).toBeFalsy();
  expect(() => result.current.exists()).toThrowError();
  expect(() => result.current.get()).toThrowError();

  await waitFor(() => {
    expect(result.current.loaded()).toBeTruthy();
    expect(result.current.exists()).toBeTruthy();
    expect(result.current.existence).toEqual("exists");

    expect(result.current.get()).toEqual(theAnswer);
    expect(result.current.record).toEqual(theAnswer);
  });
});
