# Setup of node and yarn

The version of node needs to be consistent across all yarn workspaces in the
repository. JS-based Cloud Functions require Node 12 (soon to be Node 14).
Therefore, we should be using Node 12 for now.

## Installing node

It is possible to install node via brew or nvm. Make sure node is not
installed via brew, and instead use nvm.

Install nvm by following the instructions in
https://github.com/nvm-sh/nvm#installing-and-updating.

Then, install Node 12 by running `nvm install 12`.

## Installing yarn

The recommended way to install yarn is via npm, see
https://classic.yarnpkg.com/en/docs/install/#mac-stable using the command
`npm install -g yarn`.
