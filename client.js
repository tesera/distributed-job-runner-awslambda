#!/usr/bin/env node
var SQSWorker = require('sqs-worker');
var spawn = require('child-proccess').exec;

function start(queueUrl) {
    var options = { 
        url: queueUrl
    };

    // - get task from queue
    // - run the task cmd as child_process
    // - outcome ok
    // - get other task
    // - no task
    // - terminate yourself i.e. aws ec2 terminate-instance -insstanceId $myinstanceid

    function worker(notifi, done) {
        var message
        try {
            message = JSON.parse(notifi.Data)
        } catch (err) {
            throw err
        }

        exec(message,
          function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
                done(null, false);
            } else {
                done(null, true);
            }
        });
    }

    new SQSWorker(options, worker)

};

start(process.argv[2]);
