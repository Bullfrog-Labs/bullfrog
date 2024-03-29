# Guides

**_Note: Terraform is not in use yet, so please ignore it for now._**

# Deploying the active site

    village/deploy/bin/deploy-all

# Deploy a non-active site

1. "Change the active site" (see below).

2. "Deploy the default site" (see above).

# Change the active site

Each site (village public, village private) is associated with a different firebase project.

You must change the active site context to deploy and work locally on that site.

## Change the react env locally

    # ex. village-b4647
    PROJECT_ID=<project id>
    cd village-web
    cp .env.${PROJECT_ID}.local .env

## Change the active firebase project

    firebase use $PROJECT_ID

# Create a new site instance

## Create a new project and web app

    # Ex. village-staging
    PROJECT_ID=<project id>

    # Ex. "Village Staging"
    DISPLAY_NAME=<project display name>

    # This is the org id for blfrg.xyz
    ORG_ID=479783666121

    # Create the project
    firebase projects:create --display-name $DISPLAY_NAME --organization $ORG_ID $PROJECT_ID

    # Use the new app
    firebase use $PROJECT_ID
    firebase apps:create WEB "village-web"

## Create a village-web config file

Get the web app config values, and save them to a .env file named ex. `.env.staging.local`.

Fetch the sdk config with the following command:

    firebase apps:sdkconfig WEB

Copy an existing .env file - ex. `.env.prod.local` - and fill in the appropriate values.

To use the appropriate config, copy it to replace the existing `.env`:

    cd village-web
    cp .env.staging.local .env

React will automatically load these values when you run locally.

## Set prerender proxy configs

    firebase functions:config:set prerender.token=<token from prerender.io>
    firebase functions:config:set prerender.index_html_location=<full url to index.html>

## If you're planning to support twitter auth

Set the twitter username lookup configs (find these values in the twitter developer team account).

    firebase functions:config:set twitter.secret=<consumer_secret>
    firebase functions:config:set twitter.key=<consumer_key>
    firebase functions:config:set twitter.bearer_token=<bearer_token>

Enable Twitter auth in the auth section in the firebase console (can't be done programmatically). You will need to supply a callback url to the Twitter app config.

## If you're just planning to support google auth

Enable Google auth in the auth section in the firebase console (can't be done programmatically). You can use help@blfrg.xyz as the help email.

Clone the twitter auth config since the function will still need to run on deploy (??):

    firebase functions:config:clone --from village-b4647

## Manually add the project to a billing account

Visit the billing page in GCP console for the new project. Link the to the blfrg.xyz billing account from there.

## Manually enable firestore in the firestore console

Visit the Firestore page in firebase console to create a database.

## Deploy firebase

Make sure latest typescript is installed, else you may hit an error in building functions.

From village:

    firebase deploy

## Whitelist your user

Find the uid, UID, by looking for it in the console logs when you try to sign in.

Create a collection in Firestore called `whitelist` and add a record with $UID as the id of the record.

## (Optional) If you want to do backups, manually create a bucket for them

Visit the GCP GSC page in the console, and create a new bucket named `bf_backups_$PROJECTID`.
