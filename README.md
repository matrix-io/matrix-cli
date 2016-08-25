## Welcome to your MatrixOS Console Line Interface

## NOTICE: This is not yet ready for public use. Check back Sept 2016.

# Installation

```
npm install matrix-cli -g
```
OR
```
git clone https://github.com/matrix-io/matrix-cli
cd matrix-cli
npm install
# makes global `matrix` available
npm link

```
```
> matrix

_  _ ____ ___ ____ _ _  _
|\/| |__|  |  |__/ |  \/   _ | [o]
|  | |  |  |  |  \ | _/\_ |_ |_ | v1.1.1  - dev


---- SETUP ----
login - Login to the MATRIX platform
logout - Log out of the MATRIX platform
 use - Indicate active device
 set - set environment settings, update application configuration
     ↳ [env <environment>, config <app> k=v]

-- MANAGEMENT --
 sim - manage local MatrixOS simulator using docker
     ↳ [ init, restore, start, stop, save, clear ]
list - information about your devices, applications and installations
     ↳ [ apps, devices, all, groups ]
reboot - Reboots the MATRIX.

----- APPS -----
search - Search for apps
install - [-a] app and [-s] sensor install. defaults to app
update - Update, update app1, update app1 v0.1
uninstall - Usage: uninstall app1
start - Starts an app running on the MATRIX.
stop - Stops an app running on the MATRIX.
restart - Restarts an app running on the MATRIX.

- DEVELOPMENT -
create - Creates a new scaffolding for a MATRIX App.
deploy - Deploys an app to the Matrix.
trigger - Runs a trigger test
log - logs output from selected MatrixOS
```

## Login First

Register first for an account at [http://admobilize.com](AdMobilize)
```
> matrix login
```
In order to issue commands, an active MatrixOS must be indicated via ID. MatrixOS can be deployed to devices or via a simulator.

## Device Selection

Devices must first be authorized via Bluetooth or Discovery.
```
> matrix list devices
```
```
┌────────────────────────────────────────┬───────────────┬────┬───────────────┐
│ Device ID                              │ Name          │ ok │ Last Online   │
│ my-matrix                              │ main          │ ok │ Today         │
└────────────────────────────────────────┴───────────────┴────┴───────────────┘
```

Select a device ID from this list.
```
> matrix use my-matrix
```

## Simulator Selection

### Setup A Simulator
Firstly, [https://docs.docker.com/engine/installation/](Install Docker)

### New to Docker?
```
docker-machine create --driver virtualbox matrix
```
You may wish to create a differently named virtual box if you anticipate using Docker for other images. At AdMobilize, we prefer `dev` for brevity.

```
docker-machine create --driver virtualbox dev
```

### start container
```
docker-machine start matrix
```
Initialize a Matrix Simulator. This will register an instance of matrixOS with your user account and for all purposes be seen as a Device in the ecosystem.

### install or update docker image
```
docker pull admobilize/MatrixOSÎ
or
matrix sim upgrade
```
### register simulator instance
```
matrix init sim
```
Name and describe your sim. This will register the instance with our servers and return a Virtual Device Identifier. A shortcut command provided.

### Start Virtual Device
```
matrix sim start
```
This will drop your terminal into a Docker container.

This output can also be seen via `matrix log`.

### Configure Matrix command
```
matrix use sim-deviceid15here
```
Configures `matrix` to issue commands against this virtual device.

### Turn On Virtual device
```
matrix sim start
```

## Once you have an active MatrixOS Device

### Find an appname
```
matrix search <query>
```
Select an app to install

```
matrix install app <appname>
```
+
```
matrix start <appName>
```

### Read some logs to see datas
```
matrix log
```

## Matrix App Development


### Example App Structure
```
matrix create foo
```
Makes a folder with a few files.

```
New Folder:> foo/
        app.js - this is your application logic
   config.yaml - change variables, indicate sensors, configure dashboard
  DEVELOPER.MD - information about developing Matrix apps
      index.js - app entry point, do not modify
  package.json - node.js information file, do not modify without knowledge
```

### Development
Start with the configuration. Then Learn the API. Make some changes.

### Deploy and start using Active device

```
matrix deploy foo
```
+
```
matrix start foo
```

### Debug Active Device

```
matrix log
```

## Interact with your App

### Set application variables

```
matrix set <appName> key=value
```
Change the configuration of your apps on the fly, as they are running.

### Trigger application events

```
matrix trigger foo-event "bar"
```

Sends trigger to

```
matrix.on('event', function(data){});
```



## For Matrix-Console Developers

### Globalize Master Command
Use `sudo npm link` after `git clone` to make `matrix` available globally.

### Refreshing Tarfile
```
#dont gzip, not supported
tar vcf baseapp.tar baseapp
```
