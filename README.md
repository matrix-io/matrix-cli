Matrix Console will communicate with the device via API.

### Turn any device into an admatrix

* wget https://download.matrix.io/rpi2/matrix.latest.tar.gz;
* tar czvf matrix.latest.tar.gz matrix && cd matrix;
* matrix install;


### Manage your AdMatrix

```
Usage: matrix [options] [command]


  Commands:

    login                    Log into the Matrix platform and see your available devices.
    list-devices             Get a list of devices.
    use <cmd>                Options: Use [name] or [identifier] to interact with device.
    list <cmd>               Options: [info, config, apps] once using a device.
    set-env [value]          Options: [development, staging, production]
    set-config [key=value]   Options: [info, config, apps] once using a device.
    install <app>            Usage: install app1 `POST /app/install 
    uninstall <app>          Usage: uninstall app1 `POST /app/uninstall
    logs <app>               Usage: logs app1
    update <app> [version]   Usage: update (matrix), update app1, update app1 v0.1
    logout                   Log out of all Matrix platform and devices.
    reboot                   Reboots the Matrix.
    shutdown                 Shuts down the Matrix.
    create <app>             Creates a new scaffolding for a Matrix App.
    deploy <app>             Shuts down the Matrix.
    publish <app> [version]  Publishes a version of the App to the store.
    start <app>              Starts an app running on the Matrix.
    stop <app>               Stops an app running on the Matrix.
    restart <app>            Restarts an app running on the Matrix.


	-------------------------------------------------------------------------
	   ###    ########  ##     ##    ###    ######## ########  #### ##     ##
	  ## ##   ##     ## ###   ###   ## ##      ##    ##     ##  ##   ##   ##
	 ##   ##  ##     ## #### ####  ##   ##     ##    ##     ##  ##    ## ##
	##     ## ##     ## ## ### ## ##     ##    ##    ########   ##     ###
	######### ##     ## ##     ## #########    ##    ##   ##    ##    ## ##
	##     ## ##     ## ##     ## ##     ##    ##    ##    ##   ##   ##   ##
	##     ## ########  ##     ## ##     ##    ##    ##     ## #### ##     ##
	-------------------------------------------------------------------------

			     Welcome to the AdMatrix Console.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

## Support `ad`

* ad set-env, etc...

## Tokens & Config

Tokens are stored locally in tmp/store.json as JSON storage
```
credentials: { username, password }
token: 34534534
```


## Legend

* t = type
* p = payload

## API Reference

list-devices
```
GET /device?access_token={account_identifier}

200 OK
[ 
  { id: '123abc', name: 'device1' }
  { id: '123abd', name: 'device2' }
]
```
list info
```
GET /device?device_token={device_identifier}
```
list config
```
GET /config
```
list apps
```
GET /app

200 OK
[ 
  { id: '123abc', name: 'thermo' }
  { id: '123abd', name: 'camera' }
]
```
set-env [value]
```
{ t: 'matrix.env', p: { env: 'production' } }
```
set-config [key=value]
```
{ t: 'matrix.cfg', p: { some_key: 'BAZ' } }
```
install <app>            
```
{ t: 'matrix.app-install', p: [ { name: 'camera' }, { name: 'thermo' } ] }
```
uninstall <app>          
```
{ t: 'matrix.app-uninstall', p: [ { name: 'camera' }, { name: 'thermo' } ] }
```

create <app>             Creates a new scaffolding for a Matrix App.
```
{ t: 'matrix.app-create', p: { name: 'food-tracker' } }
```

deploy <app>             Deploys an app to the Matrix
```
{ t: 'matrix.app-deploy', p: { name: 'food-tracker' } }
```

publish <app> [version]  Publishes a version of the App to the store.   
```
{ t: 'matrix.app-publish', p: { name: 'food-tracker', version: '0.0.1' } }
```
                   
start <app>
```
{ t: 'matrix.app-start', p: { name: 'food-tracker' } }
```

stop <app>   
```
{ t: 'matrix.app-stop', p: { name: 'food-tracker' } }
```

restart <app>
```
{ t: 'matrix.app-restart', p: { name: 'food-tracker' } }
```