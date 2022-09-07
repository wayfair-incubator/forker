import * as core from '@actions/core'
import {HTTP} from './const'
import {Octokit} from '@octokit/rest'

const token: string = core.getInput('token', {required: true})
const octokit = new Octokit({auth: token})

export async function changeUserPermissions(
  org: string,
  repo: string,
  user: string,
  permission: string
): Promise<void> {
  try {
    const res = await octokit.request(
      'PUT /repos/{org}/{repo}/collaborators/{user}',
      {
        org: 'org',
        repo: 'repo',
        user: 'user',
        permission: 'permission'
      }
    )
    // TODO remove debug log
    core.info(`${res.data}`)
    if (res.status === HTTP.CREATED) {
      core.debug(`New collaborator invitation created for user ${user}`)
    } else if (res.status === HTTP.NO_CONTENT) {
      core.debug(`Existing member ${user} granted ${permission} permissions`)
    }
  } catch (err: any) {
    if (err.status === HTTP.FORBIDDEN) {
      core.debug(`Unable to apply ${permission} permissions for user ${user}`)
    } else if (err.status === HTTP.VALIDATION_FAILED) {
      core.setFailed(
        `🚨 Unable to validate permissions for user ${user}: ${
          (err as Error).message
        }`
      )
    } else {
      core.info(`${org}, ${repo}, ${user}, ${permission}`)
      core.setFailed(
        `🚨 Failed to apply ${permission} permissions for user ${user}: ${
          (err as Error).message
        }`
      )
    }
  }
}

export async function forkRepo(
  owner: string,
  repo: string,
  org?: string
): Promise<void> {
  try {
    const res = await octokit.request('POST /repos/{owner}/{repo}/forks', {
      owner,
      repo,
      organization: org ? org : ''
    })
    // Forks requests are still 'Accepted' (202) if the repository already exists at the specified location
    // However, repositories with the same name but a different source are auto-incremented (eg. my-forked-repo-1)
    if (res.status === HTTP.ACCEPTED) {
      // Regex to determine whether the repository ends with a dash and a number
      const regex = /-\d+$/
      const url = res.data.html_url
      if (regex.test(url)) {
        core.info(
          `⚠️ Warning: A repository with the same name may already exist at the target destination!`
        )
        core.info(
          `As a result, the new repository fork URL might be auto-incremented (eg. my-forked-repo-1).`
        )
        core.info(
          `If this was not intentional, please check for exisiting repositories on your Github account or organization!\n`
        )
      }
      core.info(`🎉 Forked repository now available at: ${res.data.html_url}`)
    }
  } catch (err: any) {
    if (err.status === HTTP.FORBIDDEN) {
      core.setFailed(
        `🚨 Insufficient permission to fork repository: ${
          (err as Error).message
        }`
      )
    } else {
      core.setFailed(`🚨 Failed to create fork of repository: ${repo}`)
    }
  }
}

export async function getOrgMembership(
  org: string,
  user: string
): Promise<string> {
  try {
    const res = await octokit.request('GET /orgs/{org}/members/{username}', {
      org,
      username: user
    })
    // @ts-expect-error only return membership URL if response code is 204
    if (res.status === HTTP.NO_CONTENT) {
      return res.url
    } else {
      core.setFailed(
        `🚨 Failed to retrieve membership status for user: ${user}`
      )
      return ''
    }
  } catch (err: any) {
    if (err.status === HTTP.NOT_FOUND) {
      core.debug(`User ${user} not found in ${org} organization`)
    } else if (err.status === HTTP.FOUND) {
      core.setFailed(
        `🚨 Requester not a member of organization: ${(err as Error).message}`
      )
    } else {
      core.setFailed(
        `🚨 Failed to retrieve membership status for user ${user}: ${
          (err as Error).message
        }`
      )
    }
    return ''
  }
}

export async function getRepoLicense(
  owner: string,
  repo: string
): Promise<string> {
  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}/license', {
      owner,
      repo
    })
    if (res.status === HTTP.OK && res.data.license !== null) {
      const licenseKey = res.data.license.key
      if (licenseKey === 'other') {
        core.setFailed(
          `🚨 Failed to detect a valid LICENSE file for repository: ${repo}`
        )
        return ''
      } else {
        return licenseKey
      }
    } else {
      core.setFailed(`🚨 Failed to retrieve license for repository: ${repo}`)
      return ''
    }
  } catch (err) {
    core.setFailed(
      `🚨 Failed to retrieve license for repository: ${(err as Error).message}`
    )
    return ''
  }
}

export async function getUserId(user: string): Promise<number> {
  try {
    const res = await octokit.request('GET /users/{username}', {
      username: user
    })
    if (res.status === HTTP.OK) {
      return res.data.id
    } else {
      core.setFailed(`🚨 Failed to retrieve ID for user: ${user}`)
      return -1
    }
  } catch (err) {
    core.setFailed(
      `🚨 Failed to retrieve user ID for user: ${(err as Error).message}`
    )
    return -1
  }
}

export async function isOrgMember(org: string, user: string): Promise<boolean> {
  const orgMembership = await getOrgMembership(org, user)
  core.debug(`Got organization membership: ${orgMembership}`)
  return orgMembership ? true : false
}

export async function isValidLicense(
  owner: string,
  repo: string,
  whitelist: string[]
): Promise<boolean> {
  const repoLicense = await getRepoLicense(owner, repo)
  core.debug(`Got repository license: ${repoLicense}`)
  return whitelist.includes(repoLicense)
}
