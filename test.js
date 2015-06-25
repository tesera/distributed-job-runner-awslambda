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
            "AvailabilityZone": 'us-east-1c'
        },
        "NetworkInterfaces": [
            {
                "SubnetId": 'subnet-ab4ed9c0',
                "Groups": ['sg-f9ee019e'],
                "DeviceIndex": 0,
                "AssociatePublicIpAddress": true
            }
        ],
        "UserData": fs.readFileSync(path.resolve(__dirname, 'install-client.sh')).toString('utf8')
    },
    "tasks": [
        "echo hey | output.txt",
        "aws ec2 terminate-instances $instance_id"
        //"./ktpi/ktpi.r statistic ./ktpi/test/input/dem/12/3/4.tif ./dems ./output -c 5",
        //"./ktpi/ktpi.r terrain ./ktpi/test/input/12/3/4.tif ./dems ./output -c 10"
    ],
    "queueUrl": "https://sqs.us-east-1.amazonaws.com/674223647607/queue2worker"
};

var context = {
    done: function(err, data) {
        if(err) console.log('lambda exited with errors: ', err)
        else console.log('lambda exited without errors ', data)
    }
};

lambda.handler(evt, context);



//\nyum install gdal.x86_64 gdal-devel.x86_64 proj.x86_64 proj-devel.x86_64 proj-epsg.x86_64 proj-nad.x86_64 --enablerepo epel -y
//\nsRscript -e \'install.packages(c(\"yaml\", \"sp\", \"rgdal\", \"raster\"), repos=\"http://cran.r-project.org\", lib=\"/usr/share/R/library\")\'
//"Arn" : "arn:aws:iam::674223647607:instance-profile/sqs-s3"
//sudo cat /var/log/cloud-init-output.log
//aws sqs send-message --queue-url "https://sqs.us-east-1.amazonaws.com/674223647607/queue2worker --message-body "cat ls -al > /home/ec2-user/output.txt"