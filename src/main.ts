import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
const token: string = core.getInput('token', {required: true})
const octokit = new Octokit({auth: token})

async function run(): Promise<void> {
  const owner: string = core.getInput('owner', {required: true})
  const repo: string = core.getInput('repo', {required: true})
  const org: string = core.getInput('org', {required: false})
  const user: string = core.getInput('user', {required: false})
  const addUser: boolean = core.getBooleanInput('addUser', {required: false})
  const licenseWhitelist: string[] = core.getMultilineInput(
    'licenseWhitelist',
    {
      required: false
    }
  )

  try {
    // Optionally enforce a whitelist of allowed repository licenses for forking
    core.info(`Value of license whitelist: ${licenseWhitelist}`)
    core.info(`Type of license whitelist: ${typeof licenseWhitelist}`)
    for (const entry of licenseWhitelist) {
      core.info(`Array entry: ${entry}`)
    }
    core.info(`Length of array: ${licenseWhitelist.length}`)
    if (licenseWhitelist !== []) {
      core.info(`🚨🚨🚨🚨🚨 LICENSE CHECK 🚨🚨🚨🚨🚨`)
      core.info(
        `⚖️ Checking repository license for ${repo} against provided whitelist...`
      )
      if (await isValidLicense(owner, repo, licenseWhitelist)) {
        core.info(`✅ Valid license, proceeding with fork creation`)
      } else {
        core.setFailed(
          `🚨 License not found in whitelist, please check to ensure the repository is compliant`
        )
      }
    }

    // Fork the specified repo into user namespace, unless an organization is specified
    core.info(`⑂ Creating fork of repository ${repo}...`)
    const {data} = await octokit.request('POST /repos/{owner}/{repo}/forks', {
      owner,
      repo,
      organization: org ? org : ''
    })
    core.info(`🎉 Forked repository now available at: ${data.html_url}`)

    // Optionally check org membership status for a specified user, and invite if missing
    if (addUser && typeof user !== 'undefined') {
      core.info(
        `🔍 Checking membership status of user ${user} in ${org} organization...`
      )
      if (await isOrgMember(org, user)) {
        core.info(
          `✅ User ${user} already a member of ${org}, no action needed`
        )
      } else {
        core.info(
          `📥 Inviting user ${user} to ${org} org, make sure they check their inbox!`
        )
        inviteMember(org, user)
      }
    }
  } catch (err) {
    core.setFailed(`🚨 Failed to create repository fork: ${err.message}`)
  }
}

async function getOrgMembership(org: string, user: string): Promise<string> {
  let data
  try {
    data = await octokit.request('GET /orgs/{org}/members/{username}', {
      org,
      username: user
    })
    // @ts-expect-error only return membership URL if response code is 204
    if (data.status === 204) {
      return data.url
    } else {
      core.setFailed(
        `🚨 Failed to retrieve membership status for user: ${user}`
      )
      return ''
    }
  } catch (err) {
    if (err.status === 404) {
      core.debug(`User ${user} not found in ${org} organization`)
    } else if (err.status === 302) {
      core.setFailed(
        `🚨 Requester not a member of organization: ${err.message}`
      )
    } else {
      core.setFailed(
        `🚨 Failed to retrieve membership status for user: ${err.message}`
      )
    }
    return ''
  }
}

async function getRepoLicense(owner: string, repo: string): Promise<string> {
  try {
    const {data} = await octokit.request('GET /repos/{owner}/{repo}/license', {
      owner,
      repo
    })
    if (data !== null && data.license !== null) {
      return data.license.key
    } else {
      return ''
    }
  } catch (err) {
    core.setFailed(
      `🚨 Failed to retrieve license for repository: ${err.message}`
    )
    return ''
  }
}

async function getUserId(user: string): Promise<string> {
  try {
    const {data} = await octokit.request('GET /users/{username}', {
      username: user
    })
    return data.id
  } catch (err) {
    core.setFailed(`🚨 Failed to retrieve user ID for user: ${err.message}`)
    return ''
  }
}

async function inviteMember(org: string, user: string): Promise<void> {
  const id = await getUserId(user)
  const userId = Number.parseInt(id)
  core.debug(`Got user ID: ${userId}`)
  let data
  try {
    data = await octokit.request('POST /orgs/{org}/invitations', {
      org,
      invitee_id: userId
    })
    if (data.status === 201) {
      core.debug(`User successfully invited`)
    } else {
      core.debug(`Unable to validate invitation`)
      core.setFailed(`🚨 Failed to invite user to org: ${org}`)
    }
  } catch (err) {
    core.setFailed(`🚨 Failed to invite user to org: ${err.message}`)
  }
}

async function isOrgMember(org: string, user: string): Promise<boolean> {
  const orgMembership = await getOrgMembership(org, user)
  core.debug(`Got org membership: ${orgMembership}`)
  return orgMembership ? true : false
}

async function isValidLicense(
  owner: string,
  repo: string,
  whitelist: string[]
): Promise<boolean> {
  const repoLicense = await getRepoLicense(owner, repo)
  core.debug(`Got license: ${repoLicense}`)
  return whitelist.includes(repoLicense)
}

run()
