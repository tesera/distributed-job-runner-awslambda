'use strict';
var aws = require('aws-sdk');
var QWorker = require('./lib/worker');

exports.handler = function (event, context) {

    var qWorker = new QWorker(event.queueUrl);

    var actions = {
        submitJob: function () {
            return qWorker.submitJob(event);
        },
        getJobStatus: function (event) {
            return qWorker.getExportSignedUrl(event.tasks);
        },
        cancelJob: function (event) {
            return qWorker.getExportSignedUrl(event.tasks);
        }
    };

    actions[event.action](event)
        .then(function (result) {
            console.log(event.action + ' finished ');
            context.done(null, result);
        })
        .fail(context.done);
};
