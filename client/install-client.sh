#!/usr/bin/env sh

cd

# define a shell function for logging
loggly() {
	MSG=$1
	curl -H "content-type:text/plain" -d "$MSG" http://logs-01.loggly.com/inputs/3c69f1b6-85f4-4940-b1f2-a00a6a1999b3/tag/djr/
}

loggly "djr: installing worker client on $instance_id"

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
[[ $? == 0 ]] && loggly "Installed nvm" || loggly "Error installing nvm"

# invoke nvm
export NVM_DIR="/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# install and use latest node version
nvm install stable && nvm use stable
[[ $? == 0 ]] && loggly "Installed node" || loggly "Error installing node"

# get worker client
curl -o- https://raw.githubusercontent.com/tesera/scripts/master/test-job/client.js?token=AAb0E__BkknFVRLNkNCiQSPJjMq9GZMXks5WZgwUwA%3D%3D > client.js
[[ $? == 0 ]] && loggly "Got client" || loggly "Error getting client"

# install worker client dependencies
npm install -g sqs-worker && npm install -g loggly && npm install -g daemon
[[ $? == 0 ]] && loggly "Installed client dependencies" || loggly "Error installing client dependencies"

loggly "djr: instance $instance_id ready and starting work"

# start worker client deamon with task SQS URL
chmod +x client.js
node ./client.js https://sqs.us-east-1.amazonaws.com/674223647607/q2worker

loggly "djr: instance $instance_id working"
