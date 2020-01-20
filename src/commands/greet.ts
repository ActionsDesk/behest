import CommandContext from './context'

/**
 * Greet a user by username
 *
 * @param {CommandContext} context context for this command execution
 * @param {string} username the user to invite
 */
export default async function greet(
  {client, owner, repo, issueNumber}: CommandContext,
  username: string
): Promise<void> {
  const body = `:wave: Hey @${username}!`

  // eslint-disable-next-line @typescript-eslint/camelcase
  await client.issues.createComment({owner, repo, issue_number: issueNumber, body})
}
