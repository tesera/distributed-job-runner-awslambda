#!/usr/bin/env bash

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
source ~/.nvm/nvm.sh
nvm install stable
nvm use stable

curl http://raw.github... > client.js

npm install sqs-worker

node ./client.js https://sqs.us-east-1.amazonaws.com/674223647607/test-mike