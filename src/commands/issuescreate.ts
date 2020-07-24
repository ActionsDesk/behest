import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import CommandContext from './context'

/**
 * Greet a user by username
 *
 * @param {CommandContext} context context for this command execution
 * @param {string} username the user to invite
 */
export default async function issuescreate(
  {client, owner, repo, issueNumber, issueBody, basepath}: CommandContext,
  ...args: string[]
): Promise<void> {
  const message = args.join(' ')
  const scriptTemplates = path.resolve(`${basepath}/.github/workflows/ISSUE_TEMPLATE`)
  const fspec = path.resolve(`${scriptTemplates}/${message}`)
  let body

  // a little debuging info
  core.debug(message)
  core.debug(basepath)
  core.debug(scriptTemplates)
  core.debug(fspec)

  // get the template conents if the message points to a path
  if (fs.existsSync(fspec)) {
    core.info(`working with template: ${fspec}`)
    body = fs.readFileSync(fspec, 'utf8')
  } else {
    core.info(`working with message: ${message}`)
    body = message
  }

  // Get the list of repos from the current issue
  body = `${body}<br>`
  for (const line of issueBody) {
    if (!new RegExp('^/issuescreate.*').test(line)) {
      body = `${body}${line}<br>`
    }
  }
  // get the current issue body, nwo and create an issue with body
  // comment with existing issue link
  // Append tracking issues to existing repo
  // eslint-disable-next-line @typescript-eslint/camelcase
  await client.issues.createComment({owner, repo, issue_number: issueNumber, body})
}
