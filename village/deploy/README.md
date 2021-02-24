# Guides

# Deploying the site

**_Note: Terraform is not in use yet, so please ignore it for now._**

    village/deploy/bin/deploy-all

# Create a new site instance

## Create a new project and web app

    PROJECT_ID=<project id> # ex. village-staging
    DISPLAY_NAME=<project display name> # ex. "Village Staging"
    firebase projects:create --display-name $DISPLAY_NAME --organization 479783666121 $PROJECT_ID

    # Use the new app
    firebase use $PROJECT_ID
    firebase apps:create WEB $DISPLAY_NAME

## Create a village-web config file

Get the web app config values, and save them to a .env file named ex. `.env.staging.local`.

Fetch the sdk config with the following command:

    firebase apps:sdkconfig WEB

Copy an existing .env file - ex. `.env.prod.local` - and fill in the appropriate values.

To use the appropriate config, copy it to replace the existing `.env`:

    cp .env.staging.local .env

React will automatically load these values when you run locally.

## If you're planning to support twitter auth

Set the twitter username lookup configs (find these values in the twitter developer team account).

    firebase functions:config:set twitter.secret=<consumer_secret>
    firebase functions:config:set twitter.key=<consumer_key>
    firebase functions:config:set twitter.bearer_token=<bearer_token>

Enable Twitter auth in the auth section in the firebase console (can't be done programmatically). You will need to supply a callback url to the Twitter app config.

## If you're just planning to support google auth

Enable Google auth in the auth section in the firebase console (can't be done programmatically). You can use help@blfrg.xyz as the help email.

## Deploy firebase

Make sure latest typescript is installed, else you may hit an error in building functions.

From village:

    firebase deploy

## Whitelist your user

Find the uid, UID, by looking for it in the console logs when you try to sign in.

Create a collection in Firestore called `whitelist` and add a record with $UID as the id of the record.
