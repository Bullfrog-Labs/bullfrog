import { Activity } from "../../services/activities/Types";

export type ActivityNotificationProps = {
  // activity: Activity;
  activity: number;
};

export const ActivityNotification = (props: ActivityNotificationProps) => {
  return <>Row {props.activity}</>;
};
