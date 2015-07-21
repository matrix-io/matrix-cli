Matrix Console will communicate with the device via API.

### Turn any device into an admatrix

* wget https://download.matrix.io/rpi2/matrix.latest.tar.gz
* matrix install


### Manage your AdMatrix

```
Usage: matrix [options] [command]


  Commands:

    login                    Log into the Matrix platform and see your available devices.
    list-devices             Get a list of devices.
    use <cmd>                Options: Use [name] or [identifier] to interact with device.
    list <cmd>               Options: [info, config, apps] once using a device.
    set-env [value]          Options: [development, staging, production] `POST /env { t: 'matrix.env', p: { 'FOO': 'BAZ' } }`
    set-config [key=value]   Options: [info, config, apps] once using a device. `POST /config { t: 'matrix.cfg', p: { 'FOO': 'BAZ' } }`
    install <app>            Usage: install app1 `POST /app/install { t: 'matrix.app-install', p: { '0': '0123456789', '1': 01234567891 } }`
    uninstall <app>          Usage: uninstall app1 `POST /app/uninstall { t: 'matrix.app-uninstall', p: { '0': '0123456789', '1': 01234567891 } }`
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