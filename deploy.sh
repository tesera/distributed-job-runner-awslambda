#!/usr/bin/env bash


PWD=`pwd`

zip -r function.zip package.json node_modules/* lib/* index.js .env

aws lambda update-function-code \
 --function-name distributed-job-runner \
 --zip-file fileb://$PWD/function.zip \
 --region us-east-1

rm function.zip

aws s3 sync ./client s3://tesera.svc.distributed-job-runner/client
