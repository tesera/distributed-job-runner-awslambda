#!/usr/bin/env node
var SQSWorker = require('sqs-worker');
var exec = require('child_process').exec;
var aws = require('aws-sdk');
//var Q = require('q');
//require('daemon')();

function start(queueUrl) {
    var options = { 
        url: queueUrl,
        region: 'us-east-1'
    };
    var self = this;
    self.s3 = new aws.S3({ params: { Bucket: '1604-tpi' } });
    
    // - get task from queue
    // - run the task cmd as child_process
    // - outcome ok
    // - get other task
    // - no task
    // - todo terminate yourself if no other msgs present i.e. aws ec2 terminate-instances --instance-ids $instance_id
    function worker(cmd, done) {
        //var isKillMsg = /^aws ec2 terminate-instances/.test(cmd);
        console.log('logs/' + cmd.replace(/\//g, ':') + '/log.txt');
        exec(cmd,
          function (error, stdout, stderr) {

            if (error !== null) { //} || isKillMsg) {
                console.log('exec error: ' + error);
                self.s3.putObject({Key: 'logs/' + cmd.replace(/\//g, ':') + '/log.txt', Body: JSON.stringify(process.pid + ' ' + error), ContentType: 'application/json'}).send();
                //if (isKillMsg) process.exit(0);

                done(null, true);
            } else {
                console.log('exec success ');
                self.s3.putObject({Key: 'logs/' + cmd.replace(/\//g, ':') + '/log.txt', Body: JSON.stringify(process.pid + ' success'), ContentType: 'application/json'}).send();
                done(null, true);
            }
        });
    }

    new SQSWorker(options, worker)

};

start(process.argv[2]);
