# distributed-job-runner-awslambda

The purpose of this tool is to easily allow any command line task to be run on several ec2 instances which are spun up by a lambda function and then self-destruct once the work is completed.

## Deployment

In order to deploy, simply run `./deploy.sh`

## Files

    `invoke.js` This file is used for testing the lambda task locally.
    `index.js` This file defines the AWS Lambda function and is responsible for creating the job class.
    `lib/job.js` This is responsible for pulling tasks from AWS Lambda and kicking of an instance to run each one.
