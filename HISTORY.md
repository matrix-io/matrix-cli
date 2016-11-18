# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

### [1.2.6]
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
