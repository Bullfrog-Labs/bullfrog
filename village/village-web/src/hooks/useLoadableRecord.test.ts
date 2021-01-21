import * as log from "loglevel";
import { act, renderHook } from "@testing-library/react-hooks";
import { Logging } from "kmgmt-common";
import {
  coalesceMaybeToLoadableRecord,
  LoadableRecord,
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
    const [, setLR] = result.current;
    setLR(theAnswer, "exists");
  });
  expectExistsAndEqualTo(result.current[0], theAnswer);
});

test("Loaded, but non-existent, record works correctly", async () => {
  const { result } = renderHook(() => useLoadableRecord());
  act(() => {
    const [, setLR] = result.current;
    setLR(undefined, "does-not-exist");
  });
  expectDoesNotExist(result.current[0]);
});

test("Coalescing Maybe works as expected for Exists", async () => {
  const theAnswer = 42;
  const { result } = renderHook(() => useLoadableRecord());
  act(() => {
    const [, setLR] = result.current;
    setLR(...coalesceMaybeToLoadableRecord(theAnswer));
  });
  expectExistsAndEqualTo(result.current[0], theAnswer);
});

test("Coalescing Maybe works as expected for DNExists", async () => {
  const { result } = renderHook(() => useLoadableRecord());
  act(() => {
    const [, setLR] = result.current;
    setLR(...coalesceMaybeToLoadableRecord(undefined));
  });
  expectDoesNotExist(result.current[0]);
});

test("Correctly reflects load/exist state of record", async () => {
  const theAnswer = 42;
  const { waitFor, result } = renderHook(() => useLoadableRecord());

  expectNotLoaded(result.current[0]);

  act(() => {
    const delayed = async () => {
      await new Promise((r) => setTimeout(r, 100));
      const [, setLR] = result.current;
      setLR(theAnswer, "exists");
    };
    delayed();
  });

  await waitFor(() => {
    expectExistsAndEqualTo(result.current[0], theAnswer);
  });
});

test("Dependent loading should work", async () => {
  const theQuestion =
    "What is the meaning of life, the universe and everything?";
  const theAnswer = 42;

  const { waitFor, result } = renderHook(() => {
    const first = useLoadableRecord();
    const next = useLoadableRecord();

    const [firstLR, setFirstLR] = first;
    const [, setNextLR] = next;

    const firstLoad = useEffect(() => {
      const load = async () => {
        await new Promise((r) => setTimeout(r, 100));
        console.log("Loaded first");
        setFirstLR(theQuestion, "exists");
      };
      load();
    }, [setFirstLR]);

    const secondLoad = useEffect(() => {
      const load = async () => {
        if (!firstLR.loaded()) {
          console.log("first Not loaded yet");
          return;
        }
        await new Promise((r) => setTimeout(r, 50));
        // setNextLR(theAnswer, "exists");
        console.log("Loaded second");
      };
      load();
    }, [firstLR, setNextLR]);

    return {
      first: first,
      next: next,
      firstLoad: firstLoad,
      secondLoad: secondLoad,
    };
  });

  await waitFor(() => {
    expectExistsAndEqualTo(result.current.first[0], theQuestion);
    expectNotLoaded(result.current.next[0]);
  });

  await waitFor(() => {
    expectExistsAndEqualTo(result.current.first[0], theQuestion);
    expectExistsAndEqualTo(result.current.next[0], theAnswer);
  });
});
