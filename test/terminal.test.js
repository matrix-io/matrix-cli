var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');

describe('Matrix CLI Commands', function() {
    context('Not logged in', function(done) {
        it('should show a log in warning', function(done) {
            var notloggedProc = run('matrix', ['']);
            var outputs = new Array();
            notloggedProc.stdout.on('data', function(out) {
            	console.log('stdout',out.toString());
                outputs.push(out.toString());
            });

            notloggedProc.on('close', function(code) {
                outputs.should.it(matrix.);
                done();
            });

        })
    })
})
