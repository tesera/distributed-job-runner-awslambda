'use strict';
var aws = require('aws-sdk');
var Q = require('q');

var QWorker = function (queueUrl) {
    var self = this;

    self.ec2instance = new aws.EC2({ apiVersion: '2015-04-15', region: 'us-east-1' });
    self.startEC2 = Q.nbind(self.ec2instance.runInstances, self.ec2instance);

    self.queue = new aws.SQS({ apiVersion: '2012-11-05', region: 'us-east-1', params: {QueueUrl: queueUrl }});
    self.sendMessageBatch = Q.nbind(self.queue.sendMessageBatch, self.queue);

    self.s3 = new aws.S3({ params: { Bucket: '1604-tpi' } });
    self.get = Q.nbind(self.s3.getObject, self.s3);
};

QWorker.prototype.submitJob = function (options) {
    var self = this;
    self.workers = options.workers;
    //var userdata = self.workers.UserData + '\n\ncurl -o- https://raw.githubusercontent.com/tesera/queue2worker-awslambda/master/install-client.sh | bash';
    
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
        NetworkInterfaces: self.workers.NetworkInterfaces,
        UserData: new Buffer(self.workers.UserData).toString('base64') 
    };

// return self.get({Key: 'tasks.txt'})
//                 .then(function (data) {
//                     var tasks = data.Body.toString('utf8').split('\n');
//                     var params = {
//                       Entries: []
//                     };
//                     for(var task in tasks){
//                         var message = {
//                             Id: task,
//                             MessageBody: tasks[task],
//                             // MessageAttributes: {
//                             //     Id: {
//                             //       DataType: 'String',
//                             //       StringValue: tasks[task]
//                             //     }
//                             // }
//                         }
//                         params.Entries.push(message);
//                     }
//                     self.sendMessageBatch(params, function(err, data) {
//                         if (err) console.log(err, err.stack); // an error occurred
//                         else     console.log(data);           // successful response
//                     });
//                 })
    //start instance and get client to listen on queue
    return self.startEC2(params)
        .then(function (results) {
            return self.get({Key: 'tasks.txt'})
                .then(function (data) {
                    var tasks = data.Body.toString('utf8').split('\n');
                    var params = {
                      Entries: []
                    };
                    for(var task in tasks){
                        var message = {
                            Id: task,
                            MessageBody: tasks[task],
                            // MessageAttributes: {
                            //     Id: {
                            //       DataType: 'String',
                            //       StringValue: tasks[task]
                            //     }
                            // }
                        }
                        params.Entries.push(message);
                    }
                    self.sendMessageBatch(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     console.log(data);           // successful response
                    });
                })
        })
        .fail(function (e) {
            console.log('error in chain: ', e);
        });
};

module.exports = QWorker;
