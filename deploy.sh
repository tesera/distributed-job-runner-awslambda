#!/usr/bin/env bash

<<<<<<< Updated upstream
# desc:     zips up lambda function resources and uploads to aws
# usage:    ./scripts/deploy.sh
# docs:     http://docs.aws.amazon.com/cli/latest/reference/lambda/upload-function.html

zip -r function.zip package.json node_modules/* lib/* index.js .env

aws lambda update-function-code \
    --function-name shelljob \
    --zip-file fileb://function.zip
=======
# desc:   zips up lambda function resources and uploads to aws
# docs:   http://docs.aws.amazon.com/cli/latest/reference/lambda/upload-function.html

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

# aws lambda update-function-code --function-name q2worker --zip-file fileb://function.zip
>>>>>>> Stashed changes

rm function.zip
