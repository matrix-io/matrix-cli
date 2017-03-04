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
