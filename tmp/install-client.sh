#!/usr/bin/env bash

export instance_id=$(curl http://169.254.169.254/latest/meta-data/instance-id)

logger "q2worker: instance $instance_id is bootstraped"

# install and configure loggly
curl -O https://www.loggly.com/install/configure-linux.sh
sudo bash configure-linux.sh -a tesera -t 3c69f1b6-85f4-4940-b1f2-a00a6a1999b3

logger "q2worker: installing worker client on $instance_id"

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash

# invoke nvm
export NVM_DIR="/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
source ~/.bashrc

# install and use latest node version
nvm install stable
nvm use stable

# get worker client
curl -o- https://raw.githubusercontent.com/tesera/ktpi-app/gists/gists/client.js?token=AD-pS9V4PGBXJzOoTJxJijCVh-9_r_eVks5Vyn0HwA%3D%3D > client.js

# install worker client dependencies
npm install sqs-worker
npm install loggly
npm install daemon

logger "q2worker: instance $instance_id ready and starting work"

# start worker client deamon with task SQS URL
node ./client.js https://sqs.us-east-1.amazonaws.com/674223647607/q2worker

logger "q2worker: instance $instance_id working"
