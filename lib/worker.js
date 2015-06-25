'use strict';
var aws = require('aws-sdk');
var Q = require('q');

var QWorker = function () {
    var self = this;
    self.ec2instance = new aws.EC2({ apiVersion: '2015-04-15', region: 'us-east-1' });
    self.startEC2 = Q.nbind(self.ec2instance.runInstances, self.ec2instance);
    self.nameEC2 = Q.nbind(self.ec2instance.createTags, self.ec2instance);
    self.sqs = new aws.SQS({ apiVersion: '2012-11-05', region: 'us-east-1' });
    self.sendMessage = Q.nbind(self.sqs.sendMessage, self.sqs);
};

QWorker.prototype.submitJob = function (options) {
    var self = this;
    self.workers = options.workers;
    //userdata + '\n\ncurl -o- https://raw.githubusercontent.com/tesera/queue2worker-awslambda/master/install-client.sh | bash';
    
    var params = {
        MinCount: self.workers.MinCount,
        MaxCount: self.workers.MaxCount,
        KeyName: "magda",
        ImageId: self.workers.ImageId,
        InstanceType: self.workers.InstanceType,
        InstanceInitiatedShutdownBehavior: self.workers.InstanceInitiatedShutdownBehavior,
        Monitoring:  {
            Enabled: self.workers.Monitoring.Enabled
        },
        Placement: self.workers.Placement,
        IamInstanceProfile: self.workers.IamInstanceProfile,
        //SecurityGroupIds: self.workers.SecurityGroupIds,
        NetworkInterfaces: self.workers.NetworkInterfaces,
        //SubnetId: self.workers.SubnetId
        UserData: new Buffer(self.workers.UserData).toString('base64') 
    };

    return self.startEC2(params)
        .then(function (results) {

            console.log('started instance');
            
            return results;
        })
        .then(function (results) {
            //loop through instances and name
            // for (var instance in results.Instances) {
            //     console.log(results.Instances[instance].InstanceId);
            //     var params = {
            //         Resources: results.Instances[instance].InstanceId,
            //         Tags: [
            //             {
            //                 Key: 'name',
            //                 Value: 'tsi - magda test'
            //             }
            //         ]
            //     };
            //     self.nameEC2(params);
            // }
            console.log(options.tasks);
            
            // var params = {
            //     MessageBody: options.tasks,
            //     QueueUrl: 'STRING_VALUE',
            //   }
            // };
            // self.sendMessage(params, function(err, data) {
            //   if (err) console.log(err, err.stack); // an error occurred
            //   else     console.log(data);           // successful response
            // });
            
        })
        .fail(function (e) {
            console.log('error in chain: ', e);
        });
};

module.exports = QWorker;
