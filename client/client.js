#!/usr/bin/env node
'use strict';
var SQSWorker = require('sqs-worker');
var spawn = require('child_process').spawn;
var winston = require('winston');
require('winston-loggly');

var instanceId = process.env.INSTANCE_ID || 'localhost';
var taskQueueUrl = process.argv[2];

 winston.add(winston.transports.Loggly, {
    token: '3c69f1b6-85f4-4940-b1f2-a00a6a1999b3',
    subdomain: 'tesera',
    tags: ['djr','djr-instance','djr-instance-'+instanceId],
    json: true
});

winston.log('info', 'client: started with PID: '+process.pid);
require('daemon')();
winston.log('info', 'client: forked with PID: '+process.pid);

function shutdown() {
    winston.log('info', 'client: djr ' + instanceId + ' is shutting down');
    if(process.env.NODE_ENV !== 'development') {
        var shutoff = spawn('sudo', ['shutdown','-h','now']);
        shutoff.on('data', function(data) { winston.log('info', 'client: shutdown: '+data); });
        shutoff.on('close', function() { winston.log('info', 'client: shutdown ok'); });
    } else {
        winston.log('info', 'client: not shutting down since this is development');
    }
}

var timeout;
function startTimer() {
    timeout = setTimeout(shutdown, 30000);
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

    winston.log('info', 'client: ' + instanceId + ' started');

    new SQSWorker(params, function worker(task, done) {

        function log(tag, message, level){
            winston.log(level||'info', {
                tag: tag,
                instance: instanceId,
                task: task,
                queue: taskQueueUrl,
                message: 'client: '+message.toString(),
                datetime: new Date()
            });
        }

        log('', 'client: starting task');

        var work = spawn('bash', ['./runner.sh', task]);
        clearTimer();

        work.stdout.on('data', function (data) {
            log('stdout', data, 'debug');
        });

        work.stderr.on('data', function (err) {
            log('stderr', err, 'debug');
        });

        work.on('close', function (code) {
            log('done', 'Job finished on '+instanceId+' with status '+code, 'debug');
            startTimer();
            done(null, !code);
        });
    });
}

winston.log('info', 'client: ' + instanceId + ' listening on task queue ' + taskQueueUrl);

start(taskQueueUrl);
