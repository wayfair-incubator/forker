# ⑂ forker

[![version](https://img.shields.io/badge/version-0.0.1-7f187f.svg)](https://github.com/lelia/forker/releases)
![license: MIT](https://img.shields.io/badge/license-MIT-0fa573.svg)
[![contributor covenant](https://img.shields.io/badge/contributor%20covenant-2.0-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![tests](https://github.com/lelia/forker/actions/workflows/test.yml/badge.svg)](https://github.com/lelia/forker/actions/workflows/test.yml)

Github action to automate fork creation. This action uses [octokit.js](https://github.com/octokit/octokit.js) and the [GitHub API](https://docs.github.com/en/rest) to automatically create a repository fork, either in your personal namespace or an organization you administer.

Before forking a repository into an organization, `forker` will check membership and outside collaborator status for the user requesting the fork. When the `addUser` option is enabled, `forker` will automatically invite the specified `user` to become a member of the organization where the fork has been requested.

> 💡 **Note:** The email invitation will be sent from whichever account is used to authenticate the Github action and fork the requested repository, meaning there must be sufficient permissions to invite outside users to the organization.

For legal and compliance reasons, organizations or individuals can choose to provide an optional `licenseWhitelist` to compare against the [license of the repository](https://docs.github.com/en/rest/reference/licenses) being forked. If the license key returned by the Github API is not found within the provided whitelist, `forker` will exit without forking the repository.

## Developing

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

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

### Publish

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

### Validate

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

## Usage

If you're actively developing a new feature for the action, you can use a specific commit SHA:

```yaml
uses: lelia/forker@8c0d44f7a41c5819d07884857a6cfc3b2398d064
with:
  token: ${{ secrets.GH_API_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

If you have already published a [semver tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) for your changes, you can reference the latest stable version directly:

```yaml
uses: lelia/forker@releases/v0.0.1
with:
  token: ${{ secrets.GH_API_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  user: lelia
```

If you are automating forking on behalf of a Github organization, you may wish to leverage the optional `addUser` and `licenseWhitelist` params:

```yaml
uses: lelia/forker@releases/v0.0.1
with:
  token: ${{ secrets.GH_API_TOKEN }}
  repo: tremor-runtime
  owner: tremor-rs
  org: wayfair-contribs
  user: lelia
  addUser: true
  licenseWhitelist: "0bsd\napache-2.0\nmit"
```
