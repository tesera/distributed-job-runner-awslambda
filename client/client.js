#!/usr/bin/env node
'use strict';
var SQSWorker = require('sqs-worker');
var spawn = require('child_process').spawn;
var loggly = require('loggly');

require('daemon')();
var instanceId = process.env.INSTANCE_ID || 'localhost';
var taskQueueUrl = process.argv[2];

var client = loggly.createClient({
    token: '3c69f1b6-85f4-4940-b1f2-a00a6a1999b3',
    subdomain: 'tesera',
    tags: ['djr','djr-instance','djr-instance-'+instanceId],
    json: true
});

function shutdown() {
    client.log('djr ' + instanceId + ' is shutting down');
    spawn('bash', ['shutdown -h now']);
}

var timeout;
function startTimer() {
    timeout = setTimeout(30000, shutdown);
}

function clearTimer() {
    clearTimeout(timeout);
}

function start(taskQueueUrl) {
    startTimer();
    var params = {
        url: taskQueueUrl,
        region: 'us-east-1'
    };

    client.log('djr ' + instanceId + ' started');

    new SQSWorker(params, function worker(task, done) {

        function log(tag, message){
            client.log({
                tag: tag,
                worker: instanceId,
                task: task,
                payload: message.toString(),
                datetime: new Date()
            });
        }

        log('start', '');

        var work = spawn('bash', ['./runner.sh', task]);
        clearTimer();

        work.stdout.on('data', function (data) {
            log('stdout', data);
        });

        work.stderr.on('data', function (err) {
            log('stderr', err);
        });

        work.on('close', function (code) {
            log('done', 'Job finished on '+instanceId+' with status '+code);
            startTimer();
            done(null, !code);
        });
    });
}

client.log('djr ' + instanceId + ' listening on task queue ' + taskQueueUrl);

start(taskQueueUrl);
