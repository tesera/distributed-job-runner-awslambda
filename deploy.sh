#!/usr/bin/env bash

zip -r function.zip package.json node_modules/* lib/* index.js

aws lambda update-function-code \
 --function-name q2worker \
 --function-zip function.zip  \
 --runtime nodejs  \
 --role arn:aws:iam::674223647607:role/lambda_exec_shelljob \
 --handler index.handler  \
 --mode event  \
 --timeout 60  \
 --memory-size 256  \
 --region us-east-1

rm function.zip

aws s3 sync ./client s3://tesera.svc.distributed-job-runner/client
