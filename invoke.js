#!/usr/bin/env node

/* jshint quotmark: false */

'use strict';
var lambda = require('./index.js');
require('node-env-file')('.env');

var evt = {
    "action": "submitJob",
    "job": {
        "bootstrap": process.env.BOOTSTRAP,
        "runner": process.env.RUNNER,
        "install": process.env.INSTALL,
        "tasks": process.env.TASKS,
        "workers": {
            "count": 1,
            "image": "ami-1ecae776",
            "type": "t2.small"
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
