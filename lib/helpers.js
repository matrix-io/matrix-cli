var fs      = require('fs');
var Table   = require('cli-table');
var moment  = require('moment');
var _       = require('lodash');

function saveConfig(cb) {

  fs.writeFile(__dirname + '/../tmp/store.json', JSON.stringify(Matrix.config), function(err){
    if(err) throw err;
    // console.log('Config Saved', Matrix.config);
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
  return _.find(Matrix.config.deviceMap, { id: id }).name;
}

function getConfig() {
  var config;
  // See if we have existing creds on file
  if ( fs.existsSync(__dirname + '/../tmp/store.json')){
    try {
      config = JSON.parse(fs.readFileSync(__dirname + '/../tmp/store.json'));
    } catch(e){
      config = { user: {}, device:{}, client: {}};
    }
    if(Matrix.config.user !== undefined) {
       Matrix.api.user.setToken(Matrix.config.user.token);
    }

    if(Matrix.config.client !== undefined) {
       Matrix.api.client.setToken(Matrix.config.client.token);
    }

    if(Matrix.config.device !== undefined && Matrix.config.device.token !== undefined) {
       Matrix.api.device.setToken(Matrix.config.device.token);
    }
  } else {
    config = { user: {}, device:{}, client: {} };
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
