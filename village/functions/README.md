# Setup of custom environment for Cloud Functions

This is needed to provide Cloud Functions with API keys, etc.

## One-time setup of custom environment in Cloud Runtime Configuration API

Based on https://firebase.google.com/docs/functions/config-env#set_environment_configuration_for_your_project.

`firebase functions:config:set twitter.bearer_token="<BEARER_TOKEN>"`

## Retrieving custom environment variables for running locally on emulator

Based on
https://firebase.google.com/docs/functions/local-emulator#set_up_functions_configuration_optional.

```
firebase functions:config:get > .runtimeconfig.json
firebase functions:shell
```
