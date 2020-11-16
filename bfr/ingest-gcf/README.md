# Initial setup

## Pyenv setup (just once)

This is needed to ensure that we use a known version of Python. The system
Python is often 2.7, whereas we want to use some 3.x version.

From https://github.com/pyenv/pyenv#installation:

    brew update
    brew install pyenv
    echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.zshrc
    exec "$SHELL"
    pyenv install # Ensures that the specific version of Python in .python-version is used
    pip install --upgrade pip

## pipenv setup (just once)

    pip install pipenv
    pipenv install -d # needs to be done for every new virtualenv

## VSCode setup (just once)

1. Set up PyLance extension.

2. Ensure that PyLance is set up as the default python language server.

## Type-checking setup (optional, just once)

    npm install -g pyright

# Setting up sync from Pocket

1.  Activate virtual environment (do this for every new shell)
    pipenv shell

2.  Run the login script
    bin/login --consumer-key 93907-4bc0f7edcc3af162423e8b53 --login --log-level DEBUG

3.  Open the link printed (after "Got auth url ...")

4.  Approve access in the pocket web page

5.  After being redirected, wait a few seconds for the the access_token to be printed

6.  Run the update-user script using the login email for BFR

        bin/update-user --pocket-access-token <ACCESS_TOKEN> --uid <your BFR user id (get it from the Firebase Auth page or debug console logs)> --log-level DEBUG --pocket-sync-enabled

7.  Run the run-sync script to sync the bookmarks

        Set ACCESS_TOKEN and CONSUMER_KEY
        bin/run-sync

8.  Confirm your bookmarks show up in firebase after a few minutes

# Useful commands in development

## Activate virtual environment (do this for every new shell)

    pipenv shell

## Run tests

Keep the Firebase emulator running in a terminal.

    firebase emulators:start --only firestore

Run the tests

    pytest

Run the tests in watch mode

    pytest-watch

## Run type-checker in watch mode

Make sure you used npm to install pyright (see above).

    pyright --lib --watch

## Test cloud functions locally

Start the function framework server locally, using `--target` to select the
entry point.

    functions-framework --target sync_pocket_for_all_users --port 7000

Send requests to the function

    curl localhost:7000

If running `sync_pocket_for_all_users`, `CONSUMER_KEY` needs to be set. This
particular entry point does not work with the Firestore emulator yet, for
some reason.

# Scripts

## bin/login

Use this script to "log in" to pocket by fetching an access token using your
consumer key. Find your consumer key at the Pocket developer portal after
creating a Pocket application here: http://getpocket.com/developer/apps/new.
You only need to do this if you're setting up a consumer key for BFR app for
the very first time ever.

    bin/login --log-level=DEBUG --login --consumer-key=<consumer key from pocket>

When the auth URL is displayed, open it in your browser and approve the oauth
connection. The access_token and consumer_key will be printed out in the
logs.

To use the Pocket API, you need this access_token and consumer_key. See
main.py for example usage of these tokens.

## bin/run-sync

This is the entry point for the `bookmarks_sync` Cloud Function for syncing
Pocket imports, specifically the `main.sync_pocket_for_all_users` function.

It needs two env vars to be set:

ACCESS_TOKEN
CONSUMER_KEY

Both of these use the information from login_pocket.py above.

## bin/update-user

Run the command to modify your user record
