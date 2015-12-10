'use strict';

require('../test_helper');
var expect = require('chai').expect;
var assert = require('assert');
var Job = require('../../lib/job');
var nock = require('nock');

describe('Job', function() {

    var subject = new Job({
        ec2: 'ec2-value',
        sqs: 'sqs-value',
        job: {
            'bootstrap': 'http://s3.domain/bootstrap-path',
            'workers': 'workers-value',
            'runner': 'http://s3.domain/runner-path',
            'tasks': 'http://s3.domain/tasks-path',
            'install': 'http://s3.domain/install-path'
        }
    });

    describe('#contructor()', function() {

        it('should copy in the options', function(){
            expect(subject).to.have.property('ec2','ec2-value');
            expect(subject).to.have.property('sqs','sqs-value');
            expect(subject).to.have.property('bootstrap','http://s3.domain/bootstrap-path');
            expect(subject).to.have.property('workers','workers-value');
            expect(subject).to.have.property('runner','http://s3.domain/runner-path');
            expect(subject).to.have.property('tasks','http://s3.domain/tasks-path');
        });

        it('should build a workerClient value', function() {
            'su ec2-user -c "cd; aws s3 cp http://s3.domain/install-path - | bash"';
        });
    });

    describe('#_prep()', function() {

        var s3 = nock('http://s3.domain/')
            .get('/bootstrap-path').once().reply(200, 'bootstrap-code')
            .get('/tasks-path').once().reply(200, 'tasks-data');

        var expected_runner = 'su ec2-user -c "cd; curl -o- http://s3.domain/runner-path > runner.sh"';
        var expected_bootstrap = ['bootstrap-code', expected_runner, subject.workerClient].join('\n');
        var expected_tasks = 'tasks-data';

        it('should update the runner, bootstrap and tasks with data from the http path', function(done) {
            subject._prep()
                .then(function() {
                    s3.done();
                    expect(subject.bootstrap).to.equal(expected_bootstrap);
                    expect(subject).to.have.property('runner', expected_runner);
                    expect(subject).to.have.property('tasks', expected_tasks);
                    done();
                })
                .catch(done);
        });
    });
});
