import archiver from "archiver";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { HttpsError } from "firebase-functions/lib/providers/https";
import fs from "fs";
import sanitize from "sanitize-filename";
import {
  followerPostFollowEntryPath,
  postFollowsCollPath,
  postPath,
  postsCollPath,
} from "./FirestoreSchema";
import { richTextToMarkdown } from "./richtext/Utils";

const cleanupPostFollows = async (
  db: admin.firestore.Firestore,
  userId: string,
  postId: string
) => {
  // taken from https://firebase.google.com/docs/firestore/manage-data/delete-data#node.js_2.
  const batchSize = 100;
  const followsCollRef = db.collection(
    postFollowsCollPath({ userId: userId, postId: postId })
  );
  const query = followsCollRef.orderBy("__name__").limit(batchSize);

  const batchDelete = async () => {
    const snapshot = await query.get();
    const resultSize = snapshot.size;

    if (resultSize === 0) {
      // no documents left, therefore we are done
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      const followerId = doc.id;
      const followerPostFollowDocRef = db.doc(
        followerPostFollowEntryPath({ followerId: followerId, postId: postId })
      );
      batch.delete(followerPostFollowDocRef); // delete the follow on the follower
      batch.delete(doc.ref); // delete the follow on the post
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(batchDelete);
  };

  await batchDelete();
};

type PostDeleteFailReasonPostDoesNotExist = "post-does-not-exist";
type PostDeleteFailReason = PostDeleteFailReasonPostDoesNotExist;

type PostDeleteFail = {
  state: "failure";
  reason: PostDeleteFailReason;
};

type PostDeleteSuccess = {
  state: "success";
};

type PostDeleteResponse = PostDeleteSuccess | PostDeleteFail;

const postDelete = async (
  db: admin.firestore.Firestore,
  userId: string,
  postId: string
): Promise<PostDeleteResponse> => {
  // This GCF deletes the post's follows and then deletes the post itself. If
  // the number of post follows is particularly large, it may timeout before
  // completion. It would have to be pretty big to timeout with the default 1
  // minute timeout. It should be sufficient for now and the timeout can be
  // extended up to 9 minutes if needed.
  // i.e. based on
  // https://firebase.google.com/docs/firestore/solutions/delete-collections#limitations,
  // it should not be difficult to set up the function to be able to delete 2M
  // post follows in 9 minutes, which should be sufficient for our needs for a
  // long time.

  // check that post exists
  const followedPostDocRef = db.doc(
    postPath({ authorId: userId, postId: postId })
  );
  const followedPost = await followedPostDocRef.get();

  if (!followedPost.exists) {
    functions.logger.info(`${postId} by ${userId} does not exist, skipping`);
    return {
      state: "failure",
      reason: "post-does-not-exist",
    };
  }

  // clean up the post
  await followedPostDocRef.delete();

  // clean up follows
  await cleanupPostFollows(db, userId, postId);

  return { state: "success" };
};

export const handlePostDelete = async (
  db: admin.firestore.Firestore,
  userId: string,
  postId: string
): Promise<PostDeleteResponse> => {
  try {
    return await postDelete(db, userId, postId);
  } catch (e) {
    functions.logger.warn(
      `Encountered unknown error during post unfollow, ${e}`
    );
    throw new HttpsError("unknown", `Unknown error in post unfollow, ${e}`);
  }
};

export type AllPostsReadyForDownload = {
  status: "ready-for-download";
  downloadURL: string;
};

export type DownloadAllPostsResponse = AllPostsReadyForDownload;

// TODO: Set timeout to 9 minutes
export const downloadAllPostsAsMD = async (
  db: admin.firestore.Firestore,
  // storage: Storage,
  userId: string
): Promise<DownloadAllPostsResponse> => {
  const batchSize = 1;
  const outputDir = "/tmp";
  const exportsDir = `${outputDir}/exported`;
  const archiveFilename = `${outputDir}/archived-village-posts.zip`;
  const writeResults: Promise<void>[] = [];

  try {
    fs.mkdirSync(exportsDir);

    // Scan through Firestore and convert post to Markdown.
    const postsCollRef = db.collection(postsCollPath(userId));

    let startAfter: QueryDocumentSnapshot | undefined = undefined;
    while (true) {
      let query = postsCollRef.orderBy("updatedAt");
      if (!!startAfter) {
        query = query.startAfter(startAfter!);
      }
      query = query.limit(batchSize);

      const querySnapshot = await query.get();

      if (querySnapshot.size === 0) {
        break;
      }

      startAfter = querySnapshot.docs.slice(-1)[0];
      querySnapshot.forEach((doc) => {
        // Write exported post to disk.
        const filename = `${exportsDir}/${sanitize(doc.data().title)}.md`;
        const content = richTextToMarkdown(doc.data().body);
        writeResults.push(fs.promises.writeFile(filename, content));
      });
    }

    // Wait for all exported posts to finish writing
    await Promise.all(writeResults);

    // Take all exported posts on disk and zip them up.
    const archive = archiver("zip");
    archive.pipe(fs.createWriteStream(archiveFilename));
    archive.directory(exportsDir, "Village archive");
    await archive.finalize();

    // Upload zipped archive to GCS (or somewhere on local disk if running locally).
  } finally {
    // Clean-up: Delete temp files
    fs.rmdirSync(exportsDir, { recursive: true });
  }

  return {
    status: "ready-for-download",
    downloadURL: "https://foo.com",
  };
};
