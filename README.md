Matrix Console will communicate with the device via API.

Outside of our AdMatrix

* matrix install

Setup your local Matrix

* matrix login -- stores key and secret of api in a file, when logging in /oauth2/*
* matrix logout /oauth2/*
* matrix list-devices -- shows devices under your account GET /device
* matrix use device1 -- gets device token and stores locally -- stores locally /device/token

Matrix Console will use API, to deliver requests such as

* matrix set-config POST /config?name=foo&val=bar
* matrix set-env POST /env?name=foo&val=bar
* matrix list-info GET /device?id=foo&token=foo
* matrix list-config GET /config&token=foo
* matrix list-apps GET/app&token=foo
* matrix install app1 POST /app/install
* matrix update app1 POST /app/update
* matrix logs app1 GET/app/log?id=foo&token=foo
* matrix uninstall app1 DELETE /app?id=foo
* matrix reboot GET/device/reboot?token=foo
* matrix shutdown GET/device/reboot?token=foo
* matrix ssh

Deploy Apps:

* matrix deploy app1 POST /app/deploy
* matrix start app1 POST /app/start
* matrix stop app1 POST /app/stop

Support also the shorthand ad:

* ad set-env, etc...