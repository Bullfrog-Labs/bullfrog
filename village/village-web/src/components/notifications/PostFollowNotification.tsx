import { Activity } from "../../services/activities/Types";

export type PostFollowNotificationProps = {
  activity: Activity;
};
export const PostFollowNotification = (props: PostFollowNotificationProps) => {
  return <>PostFollowNotification {props.activity.createdAt.toString()}</>;
};
