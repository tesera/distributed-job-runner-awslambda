#!/usr/bin/env bash

# desc:     zips up lambda function resources and uploads to aws
# usage:    ./scripts/deploy.sh
# docs:     http://docs.aws.amazon.com/cli/latest/reference/lambda/upload-function.html

zip -r function.zip package.json node_modules/* lib/* index.js .env

aws lambda update-function-code \
    --function-name shelljob \
    --zip-file fileb://function.zip

rm function.zip
