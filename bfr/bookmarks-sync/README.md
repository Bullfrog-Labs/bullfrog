# Setup

    pip3 install -r requirements.txt

# Scripts

## bin/login

Use this script to "log in" to pocket by fetching an access token using your consumer key. Find your consumer key at the pocket developer portal.

        python3 login_pocket.py --log-level=DEBUG --login --consumer-key=<consumer key from pocket>

When the auth URL is displayed, open it in your browser and approve the oauth connection.

To use the pocket api you need an access_token and a consumer_token. See main.py for an example.

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

5.  Run the update-user script

        bin/update-user --pocket-access-token <ACCESS_TOKEN> --user-name <your login email> --log-level DEBUG --pocket-sync-enabled

6.  Confirm your bookmarks show up in firebase after a few minutes
