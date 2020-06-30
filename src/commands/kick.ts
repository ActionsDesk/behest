import * as github from '@actions/github'
import * as core from '@actions/core'

import CommandContext from './context'

/**
 * Removes users by trying to remove collaborators and then members if it fails
 */
async function removeUserFromOrg(adminClient: github.GitHub, owner: string, user: string): Promise<void> {
  try {
    await adminClient.orgs.removeOutsideCollaborator({
      org: owner,
      username: user
    })
    core.debug(`Successfully removed ${user} from Org: ${owner}`)
  } catch (error) {
    if (error.status === 422) {
      await adminClient.orgs.removeMembership({
        org: owner,
        username: user
      })
      core.debug(`Successfully removed ${user} from Org: ${owner}`)
    } else {
      throw error
    }
  }
}

/**
 * Detects the format of a given subject, either a username
 * or email address.
 *
 * @param {string} subject username or email address
 * @returns {string} format of subject
 */
function detectSubjectFormat(subject: string): 'username' | 'email' {
  if (subject.indexOf('@') > 1) {
    return 'email'
  }

  return 'username'
}

/**
 * Normalize a github username by stripping leading `@`
 *
 * @param {string} username GitHub username
 * @returns {string} normalized username
 */
function normalizeUsername(username: string): string {
  return username.replace(/@/g, '')
}

/**
 *
 * @param {github.GitHub} client Octokit instance that has read access to org and team
 * @param {string} username
 * @param org
 * @param teams
 */
async function isTeamMember(client: github.GitHub, username: string, org: string, teams: string[]): Promise<boolean> {
  let i
  for (i = 0; i < teams.length; i++) {
    const team = teams[i]

    try {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const teamMembershipResponse = await client.teams.getMembershipInOrg({org, username, team_slug: team})
      if (teamMembershipResponse.data.state === 'active') {
        return true
      }
    } catch (err) {
      // HTTP 404 just means user is not member of team
      if (err.status === 404) {
        return false
      } else {
        throw err
      }
    }
  }

  return false
}

/**
 * kick the specified user
 *
 * @param {CommandContext} context context for this command execution
 * @param {string} subject the username to kick
 */
export default async function kick(
  {adminClient, client, user, teams, owner, repo, issueNumber}: CommandContext,
  subject: string
): Promise<void> {
  core.debug(`kicking subject: ${subject}`)

  const membershipResponse = await adminClient.orgs.getMembership({org: owner, username: user})

  const canExecuteCommand =
    (await isTeamMember(adminClient, user, owner, teams)) || membershipResponse.data.role === 'admin'

  if (!canExecuteCommand) {
    throw new Error(`${user} cannot kick members.`)
  }

  if (!subject || detectSubjectFormat(subject) === 'email') {
    throw new Error('username is required')
  }

  const username = normalizeUsername(subject)
  core.debug(`kicking by username: ${username}`)
  try {
    await removeUserFromOrg(adminClient, owner, username)

    await client.issues.createComment({
      owner,
      repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issueNumber,
      body: `${subject} has been kicked!`
    })
  } catch (error) {
    core.error(`Error recieved while kicking ${username}`)
    core.error(error)
  }
}
