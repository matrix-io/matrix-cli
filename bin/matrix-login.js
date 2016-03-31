require('./matrix-init');

var debug = debugLog('login');

var prompt = require('prompt');

var schema = {
  properties: {
    username: {
      required: true
    },
    password: {
      hidden: true
    }
  }
};

prompt.delimiter = '';
prompt.message = 'matrix login -- ';
prompt.start();
prompt.get(schema, function(err, result) {
  if (err) throw err;

  /** set the creds **/
  Matrix.config.user = {
    username: result.username,
    password: result.password
  };

  /** set the client to empty **/
  Matrix.config.client = {}

  /** authenticate client and user **/
  debug('Client', Matrix.options);
  Matrix.api.auth.client(Matrix.options, function(err, out) {
    if (err) throw err;
    debug('User', Matrix.config.user, out);
    Matrix.api.auth.user(Matrix.config.user, function(err, state) {
      if(err) return console.error('Matrix CLI :'.grey, 'User Authentication Error:'.yellow, err.message.red);


      debug('User Login OK', state);
      Matrix.config.user.token = state.access_token;
      Matrix.config.client.token = out.access_token;
      Matrix.config.user.id = state.id;

      /** token stores, delete extra stuff **/
      // delete Matrix.config.user.username;
      delete Matrix.config.user.password;
      Matrix.helpers.saveConfig(function() {
        console.log('Login Successful'.green, ':'.grey, result.username);
        process.exit();
      });


      // set user token
    });
  });
  /** save the creds if it's good **/

});
