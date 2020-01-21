import * as github from '@actions/github'
import * as core from '@actions/core'

import CommandContext from './context'

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
 * Send an organization invitation by username or email
 *
 * @param {CommandContext} context context for this command execution
 * @param {string} subject the username or email address to invite
 */
export default async function invite(
  {adminClient, client, user, teams, owner, repo, issueNumber}: CommandContext,
  subject: string
): Promise<void> {
  core.debug(`inviting subject: ${subject}`)

  const membershipResponse = await adminClient.orgs.getMembership({org: owner, username: user})
  const canExecuteCommand =
    (await isTeamMember(adminClient, user, owner, teams)) || membershipResponse.data.role === 'admin'

  if (!canExecuteCommand) {
    throw new Error(`${user} cannot invite new members.`)
  }

  if (!subject) {
    throw new Error('username or email is required')
  }

  const format = detectSubjectFormat(subject)

  if (format === 'username') {
    const username = normalizeUsername(subject)
    core.debug(`inviting by username: ${username}`)
    const userResponse = await client.users.getByUsername({username})

    // eslint-disable-next-line @typescript-eslint/camelcase
    await adminClient.orgs.createInvitation({org: owner, invitee_id: userResponse.data.id})
  } else {
    core.debug(`inviting by email: ${subject}`)
    await adminClient.orgs.createInvitation({org: owner, email: subject})
  }

  await client.issues.createComment({
    owner,
    repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: issueNumber,
    body: `${subject} has been invited!`
  })
}
