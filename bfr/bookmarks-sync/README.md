# Setup

    . ./activate_venv.sh
    . ./setup_venv.sh

# Scripts

LEIGH SAYS DON'T LOOK AT THIS. Look at the "Setting up sync from pocket"
section instead!

## bin/login

Use this script to "log in" to pocket by fetching an access token using your
consumer key. Find your consumer key at the Pocket developer portal after
creating a Pocket application here: http://getpocket.com/developer/apps/new.
You only need to do this if you're setting up a consumer key for BFR app for
the very first time ever.

    python3 login_pocket.py --log-level=DEBUG --login --consumer-key=<consumer key from pocket>

When the auth URL is displayed, open it in your browser and approve the oauth
connection. The access_token and consumer_key will be printed out in the
logs.

To use the Pocket API, you need this access_token and consumer_key. See
main.py for example usage of these tokens.

## bin/run-sync

This is the main cloud function function entry point.

It needs two env vars to be set:

ACCESS_TOKEN
CONSUMER_KEY

Both of these use the information from login_pocket.py above.

## bin/update-user

Run the command to modify your user record

# Setting up sync from pocket

1.  Run the login script
    bin/login --consumer-key 93907-4bc0f7edcc3af162423e8b53 --login --log-level DEBUG

2.  Open the link printed (after "Got auth url ...")

3.  Approve access in the pocket web page

4.  After being redirected, wait a few seconds for the the access_token to be printed

5.  Run the update-user script using the login email for BFR

        bin/update-user --pocket-access-token <ACCESS_TOKEN> --user-name <your login email> --log-level DEBUG --pocket-sync-enabled

6.  Confirm your bookmarks show up in firebase after a few minutes
