var fs      = require('fs');
var Table   = require('cli-table');
var moment  = require('moment');
var _       = require('lodash');

var debug = debugLog('helpers');

function saveConfig(cb) {
  // debug('Save Config', Matrix.config, __dirname + '/../tmp/store.json');
  fs.writeFile(__dirname + '/../tmp/store.json', JSON.stringify(Matrix.config), function(err){
    if(err) console.error('Config Save:', err);
    debug('Config Saved ==>', Matrix.config);
    if ( _.isFunction(cb)){
      cb();
    }
  });
}

function removeConfig(){
  fs.unlink( __dirname + '/../tmp/store.json', function (err) {
    if (err) console.error(err)
  })
}

function lookupDeviceName(id){
  var device = _.find(Matrix.config.deviceMap, { id: id });
  return ( _.has(device, 'name')) ? device.name : undefined;
}

function getConfig() {
  var config;
  // See if we have existing creds on file
  try {
    fs.statSync(__dirname + '/../tmp/store.json');
  } catch (e){
    // no file yet
    fs.writeFileSync(__dirname + '/../tmp/store.json', JSON.stringify({ user: {}, device:{}, client: {} }));
  }

    try {
      config = JSON.parse(fs.readFileSync(__dirname + '/../tmp/store.json'));
    } catch(e){
      console.error('Config error', e )
      return { user: {}, device:{}, client: {} };
    }

    if(_.keys(config.user).length > 0) {
      Matrix.api.user.setToken(config.user.token);
    }

    if(_.keys(config.client).length > 0 ) {
      Matrix.api.client.setToken(config.client.token);
    }

    if( _.keys(config.device).indexOf('token') > -1 ){
      Matrix.api.device.setToken(config.device.token);
    }

  return config;
}

function displayKeyValue(el) {
  var table = new Table({
    head: ['Key', 'Value']
    , colWidths: [30, 30]
  });

  _.forEach(el, function(item, i) {
    table.push([ i, item ]);
  });
  return table.toString();
}

function displayApps(list){
  var items = JSON.parse(list);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: ['Name'.underline, 'v'.underline, 'Description'.underline, 'Shortname'.underline],
    colWidths: [27, 7, 30, 16]
  });

  _.forEach(items.results, function(item){
    table.push([ item.name, item.currVers, item.desc || '', item.shortname ])
  });

  return table.toString();
}

function displayDevices(el) {
  var items = JSON.parse(el);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: ['Device ID'.underline, 'Name'.underline, 'ok'.underline, 'Last Online'.underline]
    , colWidths: [40, 25, 4, 15]
  });

  //transform


  _.forEach(items.results, function(item, i) {
    var status = item.statusConnection;
    if (status === 'online'){
      status = 'ok'.green;
    } else {
      status = 'no'.red;
    }
    table.push([ item.deviceId, item.name, status, moment(item.lastHeartbeat, "YYYYMMDD").fromNow()]);
  });

  return table.toString();
}

function displayGroups(el) {
  var items = JSON.parse(el);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [ 'Name'.underline, '# Devices'.underline,'Group ID'.underline]
    , colWidths: [40, 12, 28]
  });

  _.forEach(items.results, function(item, i) {
    table.push([ item.name, _.size(item.device), item.id ]);
  });

  return table.toString();
}

function packageApp(name){
  // zip up folder
}

module.exports = {
  saveConfig:       saveConfig,
  getConfig:        getConfig,
  displayDevices:   displayDevices,
  displayGroups:    displayGroups,
  displayKeyValue:  displayKeyValue,
  displayApps:      displayApps,
  packageApp:       packageApp,
  lookupDeviceName: lookupDeviceName
};
