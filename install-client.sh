#!/usr/bin/env bash

export instance_id=$(curl http://169.254.169.254/latest/meta-data/instance-id)

loggly_domain=tesera
loggly_token=3c69f1b6-85f4-4940-b1f2-a00a6a1999b3
client_script_url=https://gist.githubusercontent.com/whyvez/dcb14605551755fa268a/raw/e2d02350f8237fd3c5f7c8e518329f6fd71c4a8e/client.js
sqs_queue_url=https://sqs.us-east-1.amazonaws.com/674223647607/q2worker

# install and configure loggly syslog client
curl -O https://www.loggly.com/install/configure-linux.sh
sudo bash configure-linux.sh -a $loggly_domain -t $loggly_token

logger "q2worker: instance $instance_id is bootstraped"

logger "q2worker: installing worker client on $instance_id"

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
source ~/.bashrc

# install and use latest node version
nvm install stable
nvm use stable

# get worker client
curl -o- $client_script_url > client.js

# install worker client dependencies
npm install sqs-worker
npm install loggly
npm install daemon

logger "q2worker: instance $instance_id ready and starting work"

# start worker client deamon with task SQS URL
node ./client.js $sqs_queue_url

logger "q2worker: instance $instance_id working"
