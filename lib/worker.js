'use strict';
var aws = require('aws-sdk');
//var pgp = require('pg-promise')();
//var Q = require('q');
//var _ = require('underscore');

var QWorker = function () {
    var self = this;
    self.ec2instance = new aws.EC2({ apiVersion: '2015-04-15', region: 'us-east-1' });
    self.startEC2 = Q.nbind(self.ec2instance.runInstances, self.ec2instance);
};

QWorker.prototype.submitJob = function (options) {
    var self = this;
    self.workers = options;
    // userdata + '\n\ncurl -o- https://raw.githubusercontent.com/tesera/queu2worker/install-client.sh | bash';
    var params = {
        MinCount: options.MinCount,
        MaxCount: options.MaxCount,
        ImageId: options.ImageId,
        InstanceType: options.InstanceType,
        IamInstanceProfile: {
            Arn : options.Arn
        },
        KeyName: "magda",
        InstanceInitiatedShutdownBehavior: options.InstanceInitiatedShutdownBehavior,
        Monitoring:  {
            Enabled: options.Monitoring.Enabled
        },
        SecurityGroups:  options.SecurityGroups,
        UserData: new Buffer(options.userData).toString('base64')
    };

    return self.startEC2(params)
        .then(function (results) {

            console.log('started instance');
            console.log(results.InstanceId);

            return results.InstanceId;
        })
        .then() {
            console.log('queue tasks');
        }
        .fail(function (e) {
            console.log('error in chain: ', e);
        });
};

module.exports = QWorker;
