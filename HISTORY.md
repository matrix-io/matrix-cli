# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
##[1.7.2]
### Fixed
- Matrix create exits cleanly
## [1.7.1]
### Changed
- New installs start on produciton environment
- Updated urls to point to current servers

## [1.7]
### Fixed
- Deploying app while running no longer leaves pending
- List apps now displays online status correctly
- Can now deploy apps in appstore
- `matrix restart` now restarts apps
- Registering a new user clears old device

## [1.6.1]
### Added
- Unpublish application

## [1.6]
### Fixed
- Device deprovisioning is handled on remove
- New devices make shortName (cli-safe)
  
  ### Added
- Refresh token if expired. Thanks @diegoribero

## [1.5]
### Changed
- Prevented duplicate device names

### Added 
- `matrix upgrade` command to show how to upgrade cli

### Fixed
- Make sure to update policy on deploy

## [1.4.0]
### Fixed
- Remove devices when test is done
### Changes
- Refactored start, stop, restart to independent services

## [1.3.9]
### Added
 - New application writes app name to package json

### Fixed
- Missing error messages, removed stack traces.
- Validate device is selected before issuing app control msg

### Changed
- New API addresses
- More strict docopt help text

## [1.3.8]
### Fixed
- Error message from firebase init
- Images deploy properly on publish
- Improvements to config read for deploy/publish 

### Added
- Error resolution text

## [1.3.7]
### Added
- ES6 passes deploy/publish linter
## [1.3.4]
### Changed
Properly handles bad searches

## [1.3.2]

### Fixed
No categories defaults to 'Development' on publish

## [0.2.0]

- Verify Config before deploy and publish

### Fixed
- Can set configuration to emails now. 

### Removed
- Publish no longer requires a selected device
- Closed off matrix set config path

## [1.2.7]
### Added
- Refactored test suite. See `test/_functions#run()`

### Test results
33 passing (2m)
14 pending

### Added
- Keeping device on login
- `matrix validate` command for testing config.yaml

### Changed
- Fixed Login Not Exiting Bug

### Removed
- Removed regex for installing sensors / apps

### Added
- Timeouts for start, stop, restart in case device is off
- matrix install supports versions
- matrix update installs latest version
- matrix remove to remove device records and data

### Changed
- Acknowledgements from device for start, stop restart
- Check for non-expired token before attempting to use
- stop apps before installing, uninstalling or deploying
- clean cancel of matrix create

## [1.2.5]
### Added
- **matrix remove** command to remove devices
- Check to not overwrite folders on create
- Start History file
- Check for token expiration
- Start, stop, restart acknowledgements from firebase

### Changed
- Apps cannot have only numbers as names
