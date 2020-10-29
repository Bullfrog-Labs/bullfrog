# Setup

    pip3 install -r requirements.txt

# Scripts

## login_pocket.py

Use this script to "log in" to pocket by fetching an access token using your consumer key. Find your consumer key at the pocket developer portal.

        python3 login_pocket.py --log-level=DEBUG --login --consumer-key=<consumer key from pocket>

When the auth URL is displayed, open it in your browser and approve the oauth connection.

To use the pocket api you need an access_token and a consumer_token. See main.py for an example.

## main.py

This is the main cloud function function entry point.

It needs two env vars to be set:

ACCESS_TOKEN
CONSUMER_KEY

Both of these use the information from login_pocket.py above.
