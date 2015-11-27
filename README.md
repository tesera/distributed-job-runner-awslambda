# distributed-job-runner-awslambda

The purpose of this tool is to easily allow any command line task to be run on several ec2 instances which are spun up by a lambda function and then self-destruct once the work is completed.

## Deployment

In order to deploy, simply run `./deploy.sh`

## Files

    `invoke.js` This is the point of first contact with AWS. Responsible for setting up env vars and starting the index.js file.
    `index.js` This is responsible for creating a instance of the Job class.
    `lib/job.js` This is responsible for pulling tasks from AWS Lambda and kicking of an instance to run each one.
