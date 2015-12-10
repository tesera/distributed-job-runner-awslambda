'use strict';

require('../test_helper');
var expect = require('chai').expect;
var Job = require('../../lib/job');

describe('Job', function() {

    var subject = new Job({
        ec2: 'ec2-value',
        sqs: 'sqs-value',
        job: {
            'bootstrap': 'bootstrap-value',
            'workers': 'workers-value',
            'runner': 'runner-value',
            'tasks': 'tasks-value',
            'install': 'install-value'
        }
    });

    describe('#contructor', function() {

        it('should copy in the options', function(){
            expect(subject).to.have.property('ec2','ec2-value');
            expect(subject).to.have.property('sqs','sqs-value');
            expect(subject).to.have.property('bootstrap','bootstrap-value');
            expect(subject).to.have.property('workers','workers-value');
            expect(subject).to.have.property('runner','runner-value');
            expect(subject).to.have.property('tasks','tasks-value');
        });

        it('should build a workerClient value', function() {
            'su ec2-user -c "cd; aws s3 cp install-value - | bash"';
        });
    });
});
