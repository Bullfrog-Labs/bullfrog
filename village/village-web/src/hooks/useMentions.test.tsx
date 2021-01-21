import * as log from "loglevel";
import { useMentions } from "./useMentions";
import { act, renderHook } from "@testing-library/react-hooks";
import { Logging } from "kmgmt-common";
import { CreatePostFn, UserPost } from "../services/store/Posts";
import { userPosts0, userPosts1, u0 } from "../testing/Fixtures";

Logging.configure(log);

test("fetches empty mentions", async () => {
  const { result } = renderHook(() =>
    useMentions(getGlobalMentions0, createPost0, authorUsername)
  );

  var [mentionables] = result.current;

  expect(mentionables).toEqual([]);
});

test("creates suggested mention when no own user match exists", async () => {
  const { waitForNextUpdate, result } = renderHook(() =>
    useMentions(getGlobalMentions0, createPost0, authorUsername)
  );

  var [mentionables, onMentionSearchChanged] = result.current;

  await act(async () => {
    onMentionSearchChanged(authorId)("wabisabi");
    await waitForNextUpdate();
  });

  var [mentionables] = result.current;

  expect(mentionables[0].value).toEqual("wabisabi");
  expect(mentionables[0].exists).toEqual(false);
});

test("creates suggested mention when only other user match exists", async () => {
  const { waitForNextUpdate, result } = renderHook(() =>
    useMentions(getGlobalMentions1, createPost0, u0.username)
  );

  var [mentionables, onMentionSearchChanged] = result.current;

  await act(async () => {
    onMentionSearchChanged(authorId)("Artifice");
    await waitForNextUpdate();
  });

  var [mentionables] = result.current;

  expect(mentionables[0].value).toEqual("Artifice");
  expect(mentionables[0].exists).toEqual(false);
});

test("fetches non empty mentions", async () => {
  const { waitForNextUpdate, result } = renderHook(() =>
    useMentions(getGlobalMentions0, createPost0, authorUsername)
  );

  var [mentionables, onMentionSearchChanged] = result.current;

  await act(async () => {
    onMentionSearchChanged(authorId)("Title");
    await waitForNextUpdate();
  });

  var [mentionables] = result.current;

  expect(mentionables[1]).toEqual({
    authorId: "123",
    authorUsername: "l4stewar",
    exists: true,
    postId: "123",
    value: "Title mane",
  });
});

const getGlobalMentions0 = async (): Promise<UserPost[]> => {
  return userPosts0;
};
const getGlobalMentions1 = async (): Promise<UserPost[]> => {
  return userPosts1;
};
const createPost0: CreatePostFn = async () => {
  return { state: "success", postId: "hjkhj", postUrl: "" };
};

const authorId = "79832475341985234";
const authorUsername = "donkeyKong";
