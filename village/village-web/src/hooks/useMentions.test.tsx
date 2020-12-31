import * as log from "loglevel";
import { useMentions } from "./useMentions";
import { act, renderHook } from "@testing-library/react-hooks";
import { Logging } from "kmgmt-common";
import { CreatePostResult, PostRecord } from "../services/store/Posts";
import { Body } from "../components/richtext/RichTextEditor";
import { u0, posts0, authProvider } from "../testing/Fixtures";

Logging.configure(log);

test("fetches empty mentions", async () => {
  const { waitForNextUpdate, result } = renderHook(() =>
    useMentions(getGlobalMentions0, createPost0, authorId)
  );

  var [mentionables, onMentionSearchChanged] = result.current;

  expect(mentionables).toEqual([]);
});

test("fetches suggested mention only when no match exists", async () => {
  const { waitForNextUpdate, result } = renderHook(() =>
    useMentions(getGlobalMentions0, createPost0, authorId)
  );

  var [mentionables, onMentionSearchChanged] = result.current;

  await act(async () => {
    onMentionSearchChanged("wabisabi");
    await waitForNextUpdate();
  });

  var [mentionables] = result.current;

  expect(mentionables[0].value).toEqual("wabisabi");
  expect(mentionables[0].exists).toEqual(false);
});

test("fetches non empty mentions", async () => {
  const { waitForNextUpdate, result } = renderHook(() =>
    useMentions(getGlobalMentions0, createPost0, authorId)
  );

  var [mentionables, onMentionSearchChanged] = result.current;

  await act(async () => {
    onMentionSearchChanged("Title");
    await waitForNextUpdate();
  });

  var [mentionables] = result.current;

  expect(mentionables[1]).toEqual({
    authorId: "123",
    exists: true,
    postId: "123",
    value: "Title mane",
  });
});

const getGlobalMentions0 = async (
  titlePrefix: string
): Promise<PostRecord[]> => {
  return posts0;
};
const createPost0 = async (
  title: string,
  body: Body,
  postId?: string
): Promise<CreatePostResult> => {
  return { state: "success", postId: "hjkhj", postUrl: "" };
};
const authorId = "79832475341985234";
