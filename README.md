> MATRIX OS (MOS) has been deprecated. We are no longer providing support for it and it may cease to function at any time. Please refer to our new library [MATRIX Lite](https://github.com/matrix-io/matrix-lite-js) to easily program your MATRIX Device with just one line of code.

## Welcome to your MatrixOS Console Line Interface

[![Build Status](https://travis-ci.org/matrix-io/matrix-cli.svg?branch=master)](https://travis-ci.org/matrix-io/matrix-cli)

###### Bugs
https://github.com/matrix-io/matrix-cli/issues

###### Questions
http://community.matrix.one

###### Documentation
http://matrix-io.github.io/matrix-documentation


# Installation

```
npm install matrix-cli -g
```

## Setup

Make sure you're using our `rc` environment.

```
matrix set env rc
```

## For Matrix-Console Developers
### Globalize Master Command
Use `sudo npm link` after `git clone` to make `matrix` available globally.

### Refreshing Tarfile
```
#dont gzip, not supported
tar vcf baseapp.tar baseapp
```

### Just for you Debug command
See the local configuration easy with `matrix debug`
