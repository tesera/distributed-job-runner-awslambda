#!/usr/bin/env sh

cd

export INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)

# define a shell function for logging
loggly() {
	MSG=$1
    LOGGLY_API_KEY=3c69f1b6-85f4-4940-b1f2-a00a6a1999b3
    LOGGLY_TAGS="djr,djr-instance,djr-instance-$INSTANCE_ID"
	curl -H "content-type:text/plain" -d "$MSG" "http://logs-01.loggly.com/inputs/$LOGGLY_API_KEY/tag/$LOGGLY_TAGS"
}

loggly "djr: installing worker client on $INSTANCE_ID"

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
[[ $? == 0 ]] && loggly "Installed nvm" || loggly "Error installing nvm"

# invoke nvm
source ~/.bashrc

# install and use latest node version
nvm install 0 && nvm use 0
[[ $? == 0 ]] && loggly "Installed node" || loggly "Error installing node"

# get worker client
aws s3 cp s3://tesera.svc.distributed-job-runner/client/client.js client.js
[[ $? == 0 ]] && loggly "Got client" || loggly "Error getting client"

# install worker client dependencies
npm install sqs-worker && npm install loggly && npm install daemon
[[ $? == 0 ]] && loggly "Installed client dependencies" || loggly "Error installing client dependencies"

loggly "djr: instance $INSTANCE_ID ready and starting work"

# start worker client deamon with task SQS URL
chmod +x client.js
node ./client.js https://sqs.us-east-1.amazonaws.com/674223647607/q2worker

loggly "djr: instance $INSTANCE_ID working"
