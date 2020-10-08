# Setup

## Install tools

### Misc

- Use VSCode for minimum friction

### Firebase tools

Firebase tools are used for managing the firebase app - database, auth etc.

    yarn global add firebase-tools

## Start the app

    yarn start

## Run tests

To run the tests run:

    yarn test

The test runner stays active in a tab and reruns automatically.

Tests should always be passing in a clean checkout.

## Run storybook

    yarn storybook

## Set up VSCode

VSCode will encourage you to install most of these automatically, but we list them here anyway.

Install the following extentions:

- ESLint
- Github Markdown Preview
- Prettier - Code Formatter

For Prettier, enable format on save to ensure the code stays formatted nicely:

    Preferences > Settings > Editor > Format On Save

# Running tools

Tools are located under `tools/`.

To run tools you need to setup service account credentials as follows:

1. Navigate to the firebase console > Project settings (the gear beside "Project Overview") > Service accounts.

2. Hit "Generate new private key".

3. Download the private key to `~/.gcp-creds`.

4. In .env.admin, set `GOOGLE_APPLICATION_CREDENTIALS=<path to creds>`.

5. Run tools with `npm run ts-node tools/...`
