# Setup

## Install tools

### Install expo cli:

    npm install -g expo-cli

## Install packages

    npm install

## Install expo client

Find the expo client in the IOS/android app store and install it.

## Start the expo server

    npm start

## Open the app on your device

On android, scan the bardcode in the terminal.

On IOS, send yourself the url for the expo server. Easiest way is to type `e` in the expo server tab and follow the prompt.

## Run tests

Same as normal react:

    npm test

## Make changes

Changes will be reflected in your app as you make em.

# Troubleshooting

## Expo client window stuck at 100% downloading or building js bundle

Try restarting the expo client

# Guides

## Building and deploying standalone native apps

### IOS

1.  Increment the build number for the build in `app.json`. Ex. increment the build number below to 1.0.4.

        ...

        "buildNumber": "1.0.3",

        ...

2.  Run the following command. Note you will be asked to provide two credentials: a) Your apple developer account credentials, and b) an app-specific password for the upload script. The script should explain where to find these.

        tools/build-and-upload-ios.sh

### Android

Run the following:

    tools/build-and-upload-android.sh
