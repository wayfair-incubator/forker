# ⑂ forker

[![Version](https://img.shields.io/badge/Version-0.0.1-7F187F.svg)](https://github.com/lelia/forker/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-7462E0.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-24B8EE.svg)](CODE_OF_CONDUCT.md)
[![Tests](https://github.com/lelia/forker/actions/workflows/test.yml/badge.svg)](https://github.com/lelia/forker/actions/workflows/test.yml)

Github action to automate fork creation. This action uses [octokit.js](https://github.com/octokit/octokit.js) and the [GitHub API](https://docs.github.com/en/rest) to automatically create a repository fork, either in your personal namespace or an organization you administer.

Before forking a repository into an organization, `forker` will check membership and outside collaborator status for the user requesting the fork. When the `addUser` option is enabled, `forker` will automatically invite the specified `user` to become a member of the organization where the fork has been requested.

For legal and compliance reasons, organizations or individuals can choose to provide an optional `licenseAllowlist` to compare against the [license of the repository](https://docs.github.com/en/rest/reference/licenses) being forked. If the license key returned by the Github API is not found within the provided allowlist, `forker` will exit without forking the repository.

## Inputs

### `token` (string, required)

The Github API [token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) you wish to use for automating fork creation. If you are using Github [encrypted secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#using-encrypted-secrets-in-a-workflow), you should reference the variable name you have defined for your secret.

> 💡 **Note:** Ensure the token you are using has sufficient permissions to create repositories in your intended destination (either an organization or individual user account).

**Example:** `${{ secrets.GH_API_TOKEN }}`

**Default:** `${{ github.token }}`

### `owner` (string, required)

The owner of the Github repository you wish to fork. Can be an organization or individual user account.

**Example:** `tremor-rs`

### `repo` (string, required)

The name of the Github repository you wish to fork.

**Example:** `tremor-runtime`

### `org` (string, optional)

The name of the destination Github organization where you wish to fork the specified repository.

**Example:** `wayfair-contribs`

### `user` (string, optional)

The Github account for the person requesting the fork.

> 💡 **Note:** This is only required if you are managing a Github organization, and wish to associate a specific user with the fork request. If neither `org` nor `user` inputs are specified, `forker` will default to forking the repository into your own Github account.

**Example:** `lelia`

### `addUser` (boolean, optional)

When used in combination with the `org` and `user` inputs, the `addUser` option will automatically invite a specified Github user to the destination organization if they are not already a member.

> 💡 **Note:** The email invitation will be sent from whichever account is used to authenticate the Github action and fork the requested repository, meaning there must be sufficient permissions to invite outside users to the organization.

**Example:** `true`

**Default:** `false`

### `licenseAllowlist` (optional, string)

A newline-delimited (`"\n"`) string representing a list of allowed [license keys](https://docs.github.com/en/rest/reference/licenses) for the repository being forked. If the license key returned by the [Licenses API](https://docs.github.com/en/rest/reference/licenses) is not found within the `licenseAllowlist`, `forker` will **not** fork the repository, and instead exit with a warning.

> 💡 **Tip:** You can always reference [this directory](https://github.com/github/choosealicense.com/tree/gh-pages/_licenses) if you need a comprehensive list of license keys, beyond the commonly-used licenses returned from `GET /licenses` in the [Github REST API](https://docs.github.com/en/rest/reference/licenses#get-all-commonly-used-licenses).

**Example:** `"0bsd\napache-2.0\nmit"`

## Usage

### Typical

In most cases, you'll want to use the latest stable version (eg. `v0.0.1`):

```yaml
uses: lelia/forker@releases/v0.0.1
with:
  token: ${{ secrets.GH_API_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

### Development

If you're actively [developing](#Developing) a new feature for the action, you can always reference a specific commit SHA (eg. `16a9cab520b7f00e68397a7b8a4067ac40353230`):

```yaml
uses: lelia/forker@899add26c0bb00f6c8366cd8c5555e9309580193
with:
  token: ${{ secrets.GH_API_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

### Advanced

If you are automating forking on behalf of a Github organization, you may wish to leverage the optional `addUser` and `licenseAllowlist` params:

```yaml
uses: lelia/forker@releases/v0.0.1
with:
  token: ${{ secrets.GH_API_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  org: wayfair-contribs
  user: lelia
  addUser: true
  licenseAllowlist: "0bsd\napache-2.0\nmit"
```

## Developing

> 💡 **Tip:**  You'll want to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies

```bash
npm install
```

Build the typescript and package it for distribution

```bash
npm run build && npm run package
```

Run the tests ✅

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)
```

### Publishing

Actions are run from GitHub repos so we will checkin the packed `dist/` folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
npm run package
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v0.0.1
```

> 💡 **Note:** We recommend using the `--license` option for `ncc`, which will create a license file for all of the production node modules used in your project.

Your action is now published! 🚀

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) for more details.

### Validation

You can now validate the action by referencing `./` in a workflow in your repo (see [`test.yml`](.github/workflows/test.yml))

```yaml
uses: ./
with:
  path: ./
  token: ${{ secrets.GH_API_TOKEN }}
  ref: ${{ github.event.pull_request.head.sha }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

See the [Actions tab](https://github.com/lelia/forker/actions) to view runs of this action!  ✅
