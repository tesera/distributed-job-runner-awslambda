'use strict';
var aws = require('aws-sdk');
var Q = require('q');
var request = require('request');
var _ = require('underscore');

var Job = function (options) {
    var self = this;
    self.runAs = 'ec2-user';
    self.ec2 = options.ec2;
    self.sqs = options.sqs;
    self.workers = options.job.workers;
    self.runner = options.job.runner;
    self.tasks = options.job.tasks;
    self.workerClient = 'su '+self.runAs+' -c "cd; aws s3 cp ' + options.job.install + ' - | bash"';
};

Job.prototype._prep = function () {
    var self = this;

    return Q.allSettled([
        Q.nfcall(request, self.tasks)
    ]).then(function (results) {
        self.runner = 'su '+self.runAs+' -c "cd; curl -o- ' + self.runner + ' > runner.sh"';
        self.bootstrap = [self.runner, self.workerClient].join('\n');
        self.tasks = results[0].value[1];
    });
};

Job.prototype._startWorkers = function () {
    var self = this;
    var ec2 = new aws.EC2({region: 'us-east-1'});

    console.log('starting workers');

    function startWorkers(){
        var params = {
            MinCount: self.workers.count,
            MaxCount: self.workers.count,
            KeyName: self.ec2.KeyName,
            ImageId: self.workers.image,
            InstanceType: self.workers.type,
            Monitoring:  {
                Enabled: true
            },
            IamInstanceProfile: self.ec2.IamInstanceProfile,
            NetworkInterfaces: [{
                SubnetId: self.ec2.SubnetId,
                Groups: self.ec2.SecurityGroupIds,
                DeviceIndex: 0,
                AssociatePublicIpAddress: true
            }],
            InstanceInitiatedShutdownBehavior: 'terminate',
            UserData: new Buffer(self.bootstrap).toString('base64')
        };
        if(self.workers.count > 0) {
            console.log('starting %s workers', self.workers.count);
            return Q.nbind(ec2.runInstances, ec2)(params);
        } else {
            console.log('no worker required');
            return Q.fcall(function() { return false; });
        }
    }

    return startWorkers()
        .then(function (data) {
            var instances = data.Instances.map(function (i) {
                return {
                    id: i.InstanceId,
                    ip: i.NetworkInterfaces[0].PrivateIpAddresses[0].PrivateIpAddress
                };
            });
            var ids = instances.map(function (i) {
                return i.id;
            });
            var params = {
                Resources: ids,
                Tags: [
                    {
                        Key: 'Name',
                        Value: 'distributed-job-runner-instance'
                    }
                ]
            };

            return Q.nbind(ec2.createTags, ec2)(params)
                .then(function () {
                    return {
                        workers: instances
                    };
                });
        });
};

Job.prototype._hydrateTaskList = function () {
    var self = this;
    var sqs = new aws.SQS({region: 'us-east-1', params: { QueueUrl: self.sqs.url }});

    console.log('hydrating task list');

    var batches = _.chain(self.tasks.split('\n'))
        .groupBy(function(item, i) {
            return Math.floor(i/10);
        })
        .values()
        .map(function (messages) {
            var params = {
                Entries: messages.map(function (m) {
                    var shasum = require('crypto').createHash('sha1');
                    shasum.update(m);
                    return {
                        Id: shasum.digest('hex'),
                        MessageBody: m
                    };
                })
            };

            return Q.nbind(sqs.sendMessageBatch, sqs)(params)
                .then(console.log);
        })
        .value();

    return Q.allSettled(batches);
};

Job.prototype.start = function () {
    var self = this;

    function start() {
        return Q.allSettled([
            self._startWorkers.apply(self),
            self._hydrateTaskList.apply(self)
        ]);
    }

    return self._prep().then(start).catch(console.log);
};

module.exports = Job;
