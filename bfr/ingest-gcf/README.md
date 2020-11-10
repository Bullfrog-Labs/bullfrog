# Setup

## Pyenv setup (just once)

This is needed to ensure that we use a known version of Python. The system
Python is often 2.7, whereas we want to use some 3.x version.

From https://github.com/pyenv/pyenv#installation:

    brew update
    brew install pyenv
    echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.zshrc
    exec "$SHELL"
    pyenv install # Ensures that the specific version of Python in .python-version is used

## Poetry setup (just once)

From https://python-poetry.org/docs/#installation.

    curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
    poetry install

# Useful commands in development

## Activate virtual environment (do this for every new shell)

    poetry shell

## Run tests in watch mode

Keep the Firebase emulator running in a terminal.

    firebase emulators:start --only firestore

Run the tests in watch mode

    poetry run pytest-watch

## Test cloud functions locally

Start the function framework server locally, using `--target` to select the
entry point.

    cd ingest_gcf
    poetry run functions-framework --target sync_pocket_for_all_users --port 7000

Send requests to the function

    curl localhost:7000

If running `sync_pocket_for_all_users`, `CONSUMER_KEY` needs to be set. This
particular entry point does not work with the Firestore emulator yet, for
some reason.

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

        bin/update-user --pocket-access-token <ACCESS_TOKEN> --uid <your BFR user id (get it from the Firebase Auth page or debug console logs)> --log-level DEBUG --pocket-sync-enabled

6.  Run the run-sync script to sync the bookmarks

        Set ACCESS_TOKEN and CONSUMER_KEY
        bin/run-sync

7.  Confirm your bookmarks show up in firebase after a few minutes

# Future Python environment improvements

1. Find a way for the venv to be runnable from within VSCode. Currently,
   VSCode is only able to find the pyenv-managed interpreter, but is unable
   to find and use the venv.
