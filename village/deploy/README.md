# Guides

# Deploying the site

**_Note: Terraform is not in use yet, so please ignore it for now._**

    village/deploy/bin/deploy-all

# create new

- make
- add .env
- install tsc

        firebase functions:config:set twitter.secret="PeU4v5IB1pN4D3MbXfTBoIYkHWq0aazzCFJqyxoAqy4O4p6xQd"
        firebase functions:config:set twitter.key="Q9e5dIYtDEyDq35rmCZeytwR5"
        firebase functions:config:set twitter.bearer_token="AAAAAAAAAAAAAAAAAAAAAGbnMAEAAAAAy36l27gpQ7HoyqJcq9tL0uta88g%3DJ3OgbECFgu1ykeD9EvIX19M4ZBWHhbP6bbGZAkUbYr8Sj66GyN"

- enable auth - use goog for personal stacks, twtr for prod
- deploy
- add whitelist

# create new fb

    firebase projects:create --display-name "Village - Leigh5" --organization 479783666121 village-leigh5 --debug
    firebase use village-leigh5
    firebase apps:create WEB "Village Web - Leigh5"
    firebase apps:sdkconfig WEB
