#!/bin/sh
export EXPO_APPLE_PASSWORD=gF5QmDQ94b1s
export FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD=ilwf-zfrn-pmoh-ctaa

echo "Did you remember to bump the version number on the ios app in app.json (before running tools/build-ios.sh)? (yes/no)"
read ANSWER
if [[ "$ANSWER" != "yes" ]]; then
  echo "Bump the version in app.json, run tools/build-ios.sh, and then "
  echo "run this script again."
  exit
fi

expo upload:ios --apple-id agrodellic@gmail.com
