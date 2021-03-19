import { Activity } from "../../services/activities/Types";

export type ActivityNotificationProps = {
  activity: Activity;
};

export const ActivityNotification = (props: ActivityNotificationProps) => {
  return <>Row {props.activity.createdAt}</>;
};
