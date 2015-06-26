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
        "InstanceType": "t2.micro", 
        "IamInstanceProfile": {
            "Name" : "sqs-s3"
        },
        "InstanceInitiatedShutdownBehavior": "terminate",
        "Monitoring":  {
            "Enabled": false
        },
        "Placement": {
            "AvailabilityZone": "us-east-1c"
        },
        "NetworkInterfaces": [
            {
                "SubnetId": "subnet-ab4ed9c0",
                "Groups": ["sg-f9ee019e"],
                "DeviceIndex": 0,
                "AssociatePublicIpAddress": true
            }
        ],
        "UserData": fs.readFileSync(path.resolve(__dirname, 'install-client.sh')).toString('utf8')
    },
    "queueUrl": "https://sqs.us-east-1.amazonaws.com/674223647607/q2worker"
};

var context = {
    done: function(err, data) {
        if(err) console.log('lambda exited with errors: ', err)
        else console.log('lambda exited without errors ', data)
    }
};

lambda.handler(evt, context);
