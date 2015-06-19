'use strict';
var fs = require('fs');
var path = require('path');
var lambda = require('./index.js');

var evt = {
    "action": "submitJob",
    "workers": {
        "MinCount": "1",
        "MaxCount": "1",
        "ImageId": "ami-1ecae776",
        "InstanceType": "m1.small",
        "IamInstanceProfile": {
            "Arn" : "arn:aws:iam::674223647607:instance-profile/afgo.pgyi-ec2-role"
        },
        "InstanceInitiatedShutdownBehavior": "stop",
        "Monitoring":  {
            "Enabled": false
        },
        "SecurityGroups":  [
            "magdatest"
        ],
        "UserData": fs.readFileSync(path.resolve(__dirname, 'install-client.sh')).toString('utf8')
    },
    "tasks": [
        "echo hey | aws s3 cp - s3://mybucket/hey.txt"
        "./ktpi/ktpi.r statistic ./ktpi/test/input/dem/12/3/4.tif ./dems ./output -c 5",
        "./ktpi/ktpi.r terrain ./ktpi/test/input/12/3/4.tif ./dems ./output -c 10"
    ]
};

//'#!/bin/bash
//\nyum install gdal.x86_64 gdal-devel.x86_64 proj.x86_64 proj-devel.x86_64 proj-epsg.x86_64 proj-nad.x86_64 --enablerepo epel -y
//\nsRscript -e \'install.packages(c(\"yaml\", \"sp\", \"rgdal\", \"raster\"), repos=\"http://cran.r-project.org\", lib=\"/usr/share/R/library\")\'
//\nyum -y install node\n'
var context = {
    done: function(err, data) {
        if(err) console.log('lambda exited with errors: ', err)
        else console.log('lambda exited without errors ', data)
    }
};

lambda.handler(evt, context);