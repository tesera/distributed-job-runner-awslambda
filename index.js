'use strict';
var Job = require('./lib/job');
require('./environment');

exports.handler = function (event, context) {
    var options = {
        sqs: {
            url: process.env.sqs_url
        },
        ec2: {
            KeyName: process.env.ec2_key_name,
            SecurityGroupIds: [process.env.ec2_security_group_id],
            SubnetId: process.env.ec2_subnet_id,
            IamInstanceProfile: {
                Name : process.env.ec2_iam_instance_profile
            }
        },
        job: event.job
    };

    var job = new Job(options);

    job.start()
        .then(function (result) {
            console.log('job finished ');
            context.done(null, result);
        })
        .fail(context.done);
};
