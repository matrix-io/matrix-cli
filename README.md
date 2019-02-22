> Starting February 28th, 2019, we will be deprecating MATRIX OS (MOS). Additionally, we have created a new library called MATRIX Lite which allows you to easily program your MATRIX Device with just one line of code. To find out more information about the deprecation of MOS and to learn more about our new library, MATRIX Lite, checkout our community post [here.](https://community.matrix.one/t/mos-being-deprecated-announcing-new-library-matrix-lite/2240)

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
