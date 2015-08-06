#!/usr/bin/env node

// usage: node ./client.js https://sqs.us-east-1.amazonaws.com/674223647607/q2worker

'use strict';
var SQSWorker = require('sqs-worker');
var spawn = require('child_process').spawn;
var loggly = require('loggly');

require('daemon')();

var worker = process.env.instance_id || 'localhost';
var taskQueueUrl = process.argv[2];

var client = loggly.createClient({
    token: '3c69f1b6-85f4-4940-b1f2-a00a6a1999b3',
    subdomain: 'tesera',
    tags: ['q2worker'],
    json: true
});

function start(taskQueueUrl) {
    var params = {
        url: taskQueueUrl,
        region: 'us-east-1'
    };

    client.log('q2worker ' + worker + ' started');

    new SQSWorker(params, function worker(task, done) {
        // var selfDestruct = /^aws ec2 terminate-instances/.test(task);
        function log(tag, message){
            client.log({
                tag: tag,
                worker: process.env.instance_id,
                task: task,
                payload: message.toString(),
                datetime: new Date()
            });
        }
        log('start', '');

        var work = spawn('bash', ['./runner.sh', task]);

        work.stdout.on('data', function (data) {
            log('stdout', data);
        });

        work.stderr.on('data', function (err) {
            log('stderr', err);
        });

        work.on('close', function (code) {
            log('done', code);
            done(null, !code);
        });
    });
}

client.log('q2worker ' + worker + ' listening on task queue ' + taskQueueUrl);

start(taskQueueUrl);
