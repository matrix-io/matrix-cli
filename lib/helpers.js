var fs = require('fs');
var Table = require('cli-table');
var moment = require('moment');
var _ = require('lodash');

function saveConfig() {
  fs.writeFile(__dirname + '/../tmp/store.json', JSON.stringify(Matrix.config), function(err){
    if(err) throw err;
  });
}

function getConfig() {

  // See if we have existing creds on file
  if ( fs.existsSync(__dirname + '/../tmp/store.json')){
    Matrix.config = JSON.parse(fs.readFileSync(__dirname + '/../tmp/store.json'));    
    if(Matrix.config.user != undefined) {
       Matrix.api.user.setToken(Matrix.config.user.token);
    }

    if(Matrix.config.client != undefined) {
       Matrix.api.client.setToken(Matrix.config.client.token);
    }

    if(Matrix.config.device !== undefined && Matrix.config.device.token !== undefined) {
       Matrix.api.device.setToken(Matrix.config.device.token);
    }
  } else {
    Matrix.config = {};
  }
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

function displayDevices(el) {
  var items = JSON.parse(el);
  var table = new Table({
      head: ['Device ID', 'Name', 'Status', 'Last Online']
    , colWidths: [40, 20, 10, 15]
  });

  _.forEach(items.results, function(item, i) {
    table.push([ item.deviceId, item.name, item.statusConnection, moment(item.lastHeartbeat, "YYYYMMDD").fromNow()]);
  });

  return table.toString();
}

function displayGroups(el) {
  console.log(el);
  var items = JSON.parse(el);
  var table = new Table({
      head: ['Group ID', 'Name']
    , colWidths: [40, 20]
  });

  _.forEach(items.results, function(item, i) {
    table.push([ item.id, item.name]);
  });

  return table.toString();
}

module.exports = {
  saveConfig: saveConfig,
  getConfig: getConfig,
  displayDevices: displayDevices,
  displayKeyValue: displayKeyValue
};