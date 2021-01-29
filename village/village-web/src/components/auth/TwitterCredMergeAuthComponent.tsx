import firebase from "firebase/app";
import * as log from "loglevel";
import { useEffect } from "react";
import { useIsLoggedIn } from "../../services/auth/AppAuth";

// based on https://github.com/firebase/snippets-web/blob/d01cdd5bb99621cf790b30505f1a2a9fec744584/auth/link-multiple-accounts.js#L85-L87

export type TwitterCredMergeAuthComponentProps = {};
export const TwitterCredMergeAuthComponent = (
  props: TwitterCredMergeAuthComponentProps
) => {
  const logger = log.getLogger("TwitterCredMergeAuthComponentProps");
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    const startMerge = async () => {
      if (!isLoggedIn) {
        logger.info("User should be logged in");
        return;
      }

      const prevUser = firebase.auth().currentUser;
      logger.debug(`Merging Twitter creds into ${prevUser!.uid}`);

      const provider = new firebase.auth.TwitterAuthProvider();
      const result = await firebase.auth().currentUser?.linkWithPopup(provider);
      console.log(result?.user);
    };
    startMerge();
  }, [isLoggedIn]);

  return <></>;
};
