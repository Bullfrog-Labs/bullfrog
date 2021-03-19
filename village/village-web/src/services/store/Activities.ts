import firebase from "firebase";
import { UserRecord } from "kmgmt-common";
import { assertNever } from "../../utils";
import { Database } from "./Database";
import { PostId } from "./Posts";
import { UserId } from "./Users";

export const notificationFeedPathForUser = (userId: UserId) =>
  `/users/${userId}/notifications`;

const ACTIVITY_RECORD_CONVERTER = {};

// Listen for new activities, paginate through old ones

// Listening to query
// https://firebase.google.com/docs/firestore/query-data/listen#listen_to_multiple_documents_in_a_collection

export const listenForNewActivities = () => {};

// Pagination
// https://firebase.google.com/docs/firestore/query-data/query-cursors

// loadMoreItems = (startIndex: number, stopIndex: number) => Promise<void>
// ordering on Firestore does not match up with ordering in the web client, so
// can't use numerical indices for pagination.
// use document snapshot as query cursor: https://firebase.google.com/docs/firestore/query-data/query-cursors#use_a_document_snapshot_to_define_the_query_cursor

export const getActivitiesFromFeed = (
  startAt: firebase.firestore.DocumentSnapshot,
  limit: number
) => {};
