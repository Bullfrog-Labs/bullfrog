# Setup

## Install tools

### Misc

- Use yarn instead of npm, seems to be much faster
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

## Set up VSCode

VSCode will encourage you to install most of these automatically, but we list them here anyway.

Install the following extentions:

- ESLint
- Github Markdown Preview
- Prettier - Code Formatter

For Prettier, enable format on save to ensure the code stays formatted nicely:

    Preferences > Settings > Editor > Format On Save
