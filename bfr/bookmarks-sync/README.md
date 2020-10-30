# Setup

    . ./activate_venv.sh
    . ./setup_venv.sh

# Scripts

## login_pocket.py

Use this script to "log in" to pocket by fetching an access token using your
consumer key. Find your consumer key at the Pocket developer portal after
creating a Pocket application here: http://getpocket.com/developer/apps/new.

    python3 login_pocket.py --log-level=DEBUG --login --consumer-key=<consumer key from pocket>

When the auth URL is displayed, open it in your browser and approve the oauth
connection. The access_token and consumer_key will be printed out in the
logs.

To use the Pocket API, you need this access_token and consumer_key. See
main.py for example usage of these tokens.

## main.py

This is the main cloud function function entry point.

It needs two env vars to be set:

ACCESS_TOKEN
CONSUMER_KEY

Both of these use the information from login_pocket.py above.
