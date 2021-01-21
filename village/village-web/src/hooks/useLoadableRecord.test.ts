import * as log from "loglevel";
import { act, renderHook } from "@testing-library/react-hooks";
import { Logging } from "kmgmt-common";
import {
  coalesceMaybeToLoadableRecord,
  LoadableRecord,
  LoadRecordFn,
  useLoadableRecord,
} from "./useLoadableRecord";
import { setTimeout } from "timers";
import { useEffect } from "react";

Logging.configure(log);

const expectExistsAndEqualTo = <R extends unknown>(
  result: LoadableRecord<R>,
  value: R
) => {
  expect(result.loaded()).toBeTruthy();
  expect(result.exists()).toBeTruthy();
  expect(result.existence).toEqual("exists");

  expect(result.get()).toEqual(value);
  expect(result.record).toEqual(value);
};

const expectDoesNotExist = <R extends unknown>(result: LoadableRecord<R>) => {
  expect(result.loaded()).toBeTruthy();
  expect(result.exists()).toBeFalsy();
  expect(result.existence).toEqual("does-not-exist");

  expect(() => result.get()).toThrowError();
};

const expectNotLoaded = <R extends unknown>(result: LoadableRecord<R>) => {
  expect(result.loaded()).toBeFalsy();
  expect(() => result.exists()).toThrowError();
  expect(() => result.get()).toThrowError();
};

test("Existing record works correctly", async () => {
  const theAnswer = 42;
  const { result } = renderHook(() => useLoadableRecord());
  act(() => {
    result.current.set(theAnswer, "exists");
  });
  expectExistsAndEqualTo(result.current, theAnswer);
});

test("Loaded, but non-existent, record works correctly", async () => {
  const { result } = renderHook(() => useLoadableRecord());
  act(() => {
    result.current.set(undefined, "does-not-exist");
  });
  expectDoesNotExist(result.current);
});

test("Coalescing Maybe works as expected for Exists", async () => {
  const theAnswer = 42;
  const { result } = renderHook(() => useLoadableRecord());
  act(() => result.current.set(...coalesceMaybeToLoadableRecord(theAnswer)));
  expectExistsAndEqualTo(result.current, theAnswer);
});

test("Coalescing Maybe works as expected for DNExists", async () => {
  const { result } = renderHook(() => useLoadableRecord());
  act(() => result.current.set(...coalesceMaybeToLoadableRecord(undefined)));
  expectDoesNotExist(result.current);
});

test("Correctly reflects load/exist state of record", async () => {
  const theAnswer = 42;
  const { waitFor, result } = renderHook(() => useLoadableRecord());

  expectNotLoaded(result.current);

  act(() => {
    const delayed = async () => {
      await new Promise((r) => setTimeout(r, 100));
      result.current.set(theAnswer, "exists");
    };
    delayed();
  });

  await waitFor(() => {
    expectExistsAndEqualTo(result.current, theAnswer);
  });
});

test("Dependent loading should work", async () => {
  const theQuestion =
    "What is the meaning of life, the universe and everything?";
  const theAnswer = 42;

  const { waitFor, result } = renderHook(() => [
    useLoadableRecord(),
    useLoadableRecord(),
  ]);

  act(() => {
    const delayed = async () => {
      await new Promise((r) => setTimeout(r, 100));
      result.current[0].set(theQuestion, "exists");
      await new Promise((r) => setTimeout(r, 200));
      result.current[1].set(theAnswer, "exists");
    };
    delayed();
  });

  await waitFor(() => {
    expectExistsAndEqualTo(result.current[0], theQuestion);
    expectNotLoaded(result.current[1]);
  });

  await waitFor(() => {
    expectExistsAndEqualTo(result.current[0], theQuestion);
    expectExistsAndEqualTo(result.current[1], theAnswer);
  });
});
