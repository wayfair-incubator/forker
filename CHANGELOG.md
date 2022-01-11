# Changelog

All notable changes to `Forker` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2022-01-11

### Added

- Missing content from Wayfair's official [OSS Template](https://github.com/wayfair-incubator/oss-template)
- Dynamic release badging system for [README](https://github.com/wayfair-incubator/forker/blob/main/README.md)
- Several major `npm` package upgrades suggested by Dependabot

### Changed

- Improved `README` content and clarified developer instructions
- Used named constants instead of numerical response codes
- Used OSPO service account for all workflow tests
- Updated vulnerable `npm` packages to compliant versions
- Updated Dependabot configuration to search for `github-actions` updates

### Fixed

- Token access issue with actions integration tests
- Numerous `npm` and `typescript` dependency conflicts

## [0.0.2] - 2021-10-22

### Changed

- Updated all repository references to use `wayfair-incubator` organization
- Temporarily disabled actions integration tests while diagnosing a token access issue
- Resolved numerous node + typescript dependency vulnerabilities

## [0.0.1] - 2021-08-31

### Added

- Initial [release](https://github.com/wayfair-incubator/forker/releases/tag/v0.0.1) of `forker` and [publication](https://github.com/marketplace/actions/github-forker) on the Github Action marketplace
