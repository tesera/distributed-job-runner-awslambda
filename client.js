#!/usr/bin/env node
var SQSWorker = require('sqs-worker');
var exec = require('child_process').exec;

function start(queueUrl) {
    var options = { 
        url: queueUrl,
        region: 'us-east-1'
    };

    // - get task from queue
    // - run the task cmd as child_process
    // - outcome ok
    // - get other task
    // - no task
    // - terminate yourself if no other msgs present i.e. aws ec2 terminate-instances --instance-ids $instance_id

    function worker(cmd, done) {
        var isKillMsg = /^aws ec2 terminate-instances/.test(cmd);
        console.log(cmd);
        exec(cmd,
          function (error, stdout, stderr) {
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            if (error !== null || isKillMsg) {
                console.log('exec error: ' + error);
                if (isKillMsg) process.exit(0);
                done(null, true);
            } else {
                console.log('exec success ');
                done(null, true);
            }
        });
    }

    new SQSWorker(options, worker)

};

start(process.argv[2]);
