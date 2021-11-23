# ⑂ forker

[![Release](https://img.shields.io/github/v/release/wayfair-incubator/forker?display_name=tag)](https://github.com/wayfair-incubator/forker/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-7F187F.svg)](LICENSE)
[![Code of Conduct](https://img.shields.io/badge/CoC-2.0-24B8EE.svg)](CODE_OF_CONDUCT.md)
[![Tests](https://github.com/wayfair-incubator/forker/actions/workflows/test.yml/badge.svg)](https://github.com/wayfair-incubator/forker/actions/workflows/test.yml)

GitHub action to automate fork creation. This action uses [octokit.js](https://github.com/octokit/octokit.js) and the [GitHub API](https://docs.github.com/en/rest) to automatically create a repository fork, either in your personal namespace or an organization you administer.

Before forking a repository into an organization, `forker` will check membership and outside collaborator status for the user requesting the fork. When the `addUser` option is enabled, `forker` will automatically invite the specified `user` to become a member of the organization where the fork has been requested.

For legal and compliance reasons, organizations or individuals can choose to provide an optional `licenseAllowlist` to compare against the [license of the repository](https://docs.github.com/en/rest/reference/licenses) being forked. If the license key returned by the GitHub API is not found within the provided allowlist, `forker` will exit without forking the repository.

## Inputs

### `token` (string, required)

The GitHub API [token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) you wish to use for automating fork creation. If you are using GitHub [encrypted secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#using-encrypted-secrets-in-a-workflow), you should reference the variable name you have defined for your secret.

> 💡 **Note:** Ensure the token you are using has sufficient permissions to fork repositories into your intended destination (either an organization or individual user account). In particular, the builtin `GITHUB_TOKEN` has [read-only permissions](https://docs.github.com/en/actions/reference/authentication-in-a-workflow#permissions-for-the-github_token) for repository forks, and therefore may not provide sufficient privileges for use with `forker`.

**Example:** `${{ secrets.ACCESS_TOKEN }}`

### `owner` (string, required)

The owner of the GitHub repository you wish to fork. Can be an organization or individual user account.

**Example:** `tremor-rs`

### `repo` (string, required)

The name of the GitHub repository you wish to fork.

**Example:** `tremor-runtime`

### `org` (string, optional)

The name of the destination GitHub organization where you wish to fork the specified repository.

**Example:** `wayfair-contribs`

### `user` (string, optional)

The GitHub account for the person requesting the fork.

> 💡 **Note:** This is only required if you are managing a GitHub organization, and wish to associate a specific user with the fork request. If neither `org` nor `user` inputs are specified, `forker` will default to forking the repository into your own GitHub account. Similarly, if _only_ `user` is provided without an accompanying `org`, forker will ignore the field, since users cannot create forks on behalf of other users, only GitHub organizations.

**Example:** `lelia`

### `addUser` (boolean, optional)

When used in combination with the `org` and `user` inputs, the `addUser` option will automatically invite a specified GitHub user to the destination organization if they are not already a member.

> 💡 **Note:** The email invitation will be sent from whichever account is used to authenticate the GitHub action and fork the requested repository, meaning there must be sufficient permissions to invite outside users to the organization.

**Example:** `true`

**Default:** `false`

### `licenseAllowlist` (optional, string)

A newline-delimited (`"\n"`) string representing a list of allowed [license keys](https://docs.github.com/en/rest/reference/licenses) for the repository being forked. If the license key returned by the [Licenses API](https://docs.github.com/en/rest/reference/licenses) is not found within the `licenseAllowlist`, `forker` will **not** fork the repository, and instead exit with a warning.

> 💡 **Tip:** You can always reference [this directory](https://github.com/github/choosealicense.com/tree/gh-pages/_licenses) if you need a comprehensive list of license keys, beyond the commonly-used licenses returned from `GET /licenses` in the [GitHub REST API](https://docs.github.com/en/rest/reference/licenses#get-all-commonly-used-licenses).

**Example:** `"0bsd\napache-2.0\nmit"`

## Usage

### Typical

In most cases, you'll want to use the latest stable version (eg. `v0.0.2`):

```yaml
uses: wayfair-incubator/forker@v0.0.2
with:
  token: ${{ secrets.ACCESS_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

### Development

If you're actively [developing](#Developing) a new feature for the action, you can always reference a specific commit SHA (eg. `98e4e7dcc6c9a8cb29c1f8de7d6d2c03dcabc4b9`):

```yaml
uses: wayfair-incubator/forker@98e4e7dcc6c9a8cb29c1f8de7d6d2c03dcabc4b9
with:
  token: ${{ secrets.ACCESS_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

### Advanced

If you are automating forking on behalf of a GitHub organization, you may wish to leverage the optional `addUser` and `licenseAllowlist` params:

```yaml
uses: wayfair-incubator/forker@v0.0.2
with:
  token: ${{ secrets.ACCESS_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  org: wayfair-contribs
  user: lelia
  addUser: true
  licenseAllowlist: "0bsd\napache-2.0\nmit"
```

## Developing

> 💡 **Tip:** Please use [node](https://nodejs.org/en/download/releases/) v9.x or later, as well as an npm-compatible version of [typescript](https://www.npmjs.com/package/typescript).

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
git push origin releases/v0.0.2
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
  token: ${{ secrets.ACCESS_TOKEN }}
  ref: ${{ github.event.pull_request.head.sha }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

See the [Actions tab](https://github.com/wayfair-incubator/forker/actions) to view runs of this action!  ✅

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. For detailed contributing guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md)

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Acknowledgements

This template was adapted from [https://github.com/wayfair-incubator/oss-template](https://github.com/wayfair-incubator/oss-template) and
[https://github.com/othneildrew/Best-README-Template](https://github.com/othneildrew/Best-README-Template).
