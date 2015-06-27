# q2worker
Simple AWS Lambda task runner.

````javascript
#!/usr/bin/env node

'use strict';
var lambda = require('./index.js');
require('node-env-file')('.env');

var evt = {
    action: 'submitJob',
    job: {
        bootstrap: process.env.q2w_bootstrap, // http url to dependency shell script
        runner: process.env.q2w_runner, // http url toscript to process your tasks
        tasks: process.env.q2w_tasks, // http url to csv runner args
        workers: {
            count: 3,
            image: 'ami-1ecae776',
            type: 't2.micro'
        }
    }
};

var context = {
    done: function(err, data) {
        if(err) console.log('lambda exited with errors: ', err);
        else console.log('lambda exited without errors ', JSON.stringify(data));
    }
};

lambda.handler(evt, context);
````


````shell
sqs_url=https://sqs...
ec2_security_group_id=
ec2_subnet_id=
ec2_iam_instance_profile=
q2w_bootstrap=https://...
q2w_runner=https://...
q2w_tasks=https://...

````
