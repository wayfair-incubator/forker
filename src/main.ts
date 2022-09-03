import * as core from '@actions/core'
import {PERMISSIONS} from './const'
import {
  changeUserPermissions,
  forkRepo,
  isOrgMember,
  isValidLicense
} from './github'

export async function run(): Promise<void> {
  const owner: string = core.getInput('owner', {required: true})
  const repo: string = core.getInput('repo', {required: true})
  const org: string = core.getInput('org', {required: false})
  const user: string = core.getInput('user', {required: false})
  const checkUser: boolean = core.getBooleanInput('checkUser', {
    required: false
  })
  const promoteUser: boolean = core.getBooleanInput('promoteUser', {
    required: false
  })
  const licenseAllowlist: string[] = core.getMultilineInput(
    'licenseAllowlist',
    {
      required: false
    }
  )

  try {
    // Optionally enforce a whitelist of allowed repository licenses for forking
    if (!licenseAllowlist.includes('undefined')) {
      core.info(
        `⚖️ Checking repository license for ${repo} against provided whitelist...`
      )
      if (await isValidLicense(owner, repo, licenseAllowlist)) {
        core.info(`✅ Valid license, proceeding with fork creation`)
      } else {
        core.setFailed(
          `🚨 License not found in whitelist, please check to ensure the repository is compliant!`
        )
        // Do not proceed with fork creation if license compliance check fails
        return
      }
    }

    // Optionally enforce organization membership status for a specified user
    // Exit early if the user is determined not to be an organization member
    if (checkUser && org && typeof user !== 'undefined') {
      core.info(
        `🔍 Checking membership status of user ${user} in ${org} organization...`
      )
      if (await isOrgMember(org, user)) {
        core.info(
          `✅ User ${user} is a member of ${org}, proceeding with fork request...`
        )
      } else {
        core.setFailed(
          `🚨 User ${user} not a member of ${org}, please join the organization before trying again!`
        )
      }
    }

    // Fork the specified repo into user namespace, unless an organization is specified
    core.info(`⑂ Creating fork of repository ${repo}...`)
    await forkRepo(owner, repo, org)

    // Optionally promote the requesting user's permissions to admin for the forked repository
    if (promoteUser && org && typeof user !== 'undefined') {
      core.info(
        `⏫ Promoting user permissions for ${user} to ${PERMISSIONS.ADMIN}`
      )
      changeUserPermissions(org, repo, user, PERMISSIONS.ADMIN)
    }
  } catch (err) {
    core.setFailed(
      `🚨 Failed to create repository fork: ${(err as Error).message}`
    )
  }
}

run()
