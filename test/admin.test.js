var exec = require('child_process').exec;

describe('has admin functions', function() {
  this.timeout(15000)

  describe('can switch environments', function() {

    it('`matrix set env local`', function(done) {
      fn.run('matrix set env local', {
        checks: ['local'],
        postCheck: function(done) {
          var env = fn.readConfig().environment.name;
          if (env !== 'local') {
            done('Invalid environment:' + env)
          } else {
            done();
          }
        }
      }, done)
    })

    it('`matrix set env production`', function(done) {
      fn.run('matrix set env production', {
        checks: ['production'],
        postCheck: function(done) {
          var env = fn.readConfig().environment.name;
          if (env !== 'production') {
            done('Invalid environment')
          } else {
            done();
          }
        }
      }, done)
    })

    it('`matrix set env dev`', function(done) {
      fn.run('matrix set env dev', {
        checks: ['dev'],
        postCheck: function(done) {
          var env = fn.readConfig().environment.name;
          if (env !== 'dev') {
            done('Invalid environment')
          } else {
            done();
          }
        }
      }, done)
    })
  })

  describe('can login', function() {
    it('`matrix login`', fn.login);
  });

  describe('can make, list and delete devices', function() {
    before('`matrix register device`', fn.registerDevice);
    it('`matrix list devices`', function(done) {
      fn.run(
        'list devices', {
          checks: [
            'test-device'
          ]
        }, done);
    })

    // doesnt work right now
    it.skip('`matrix remove`', function(done) {
      fn.run('remove test-device', {
        responses: [
          ['test-device', 'y\n']
        ],
        checks: [
          'Device successfully removed'
        ]
      }, done)
    })


  });

  describe('can logout', function() {
    it('`matrix logout`', fn.logout);
  })
});