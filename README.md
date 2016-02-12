## Welcome to your AdMatrix

```

           _  _ ____ ___ ____ _ _  _
           |\/| |__|  |  |__/ |  \/   _ | [o]
           |  | |  |  |  |  \ | _/\_ |_ |_ | v1.1.0
.||..||..||..||..||..||..||..||..||..||..||..||..||..||..||..||..||..||..||..||.


API: http://dev-demo.admobilize.com Streaming: http://dev-mxss.admobilize.com:80
User: brian@rokk3rlabs.com Device: 12:23:34:45:56


    search <sensor/app/tag> - look for sensors, app names or tags
              list [target] - list apps, devices, groups
               set [target] - set env, config
     update <app> [version] - Update, update app1, update app1 v0.1
                      login - Log into the MATRIX platform
                        use - Indicate active device
          install [options] - [-a] app and [-s] sensor install. defaults to app
            uninstall <app> - Usage: uninstall app1
              log [options] - Usage: log [-f, --follow]
                     logout - Log out of all MATRIX platform and devices.
                     reboot - Reboots the MATRIX.
               create <app> - Creates a new scaffolding for a MATRIX App.
               deploy <dir> - Deploys an app to the Matrix.
    publish <app> [version] - Publishes a version of the App to the store.
                start <app> - Starts an app running on the MATRIX.
                 stop <app> - Stops an app running on the MATRIX.
              restart <app> - Restarts an app running on the MATRIX.
           trigger <string> - Runs a trigger test
```


## Turn any device into an admatrix

//TODO: insert proper workflow
* wget https://download.matrix.io/rpi2/matrix.latest.tar.gz;
* tar czvf matrix.latest.tar.gz matrix && cd matrix;
* matrix install;

### Login First

```
matrix login
```

### Then List devices

```
matrix list devices
```

### Then Use a Device

```
matrix use 12:23:34:45:56
```

### Start an app

```
matrix start base
```

### See log messages

```
matrix log
```

### Stop app

```
matrix stop base
```

### Developing Matrix Console

#### Refreshing Tarfile
```
# dont gzip, not supported
tar vcf baseapp.tar baseapp/
```
