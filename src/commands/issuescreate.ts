import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import CommandContext from './context'

export const {stat} = fs.promises

export interface NWO {
  name: string
  owner: string
}

/**
 * get a name with owner
 *
 * @param {string} git url
 */
export function getnwo(uri: string): NWO {
  try {
    const url = new URL(uri)
    const nwo: NWO = {name: url.pathname.split('/')[2], owner: url.pathname.split('/')[1]}
    // sanatize
    nwo.name = typeof nwo.name == 'undefined' ? '' : nwo.name
    nwo.owner = typeof nwo.owner == 'undefined' ? '' : nwo.owner
    return nwo
  } catch (error) {
    core.error(error)
    return {name: '', owner: ''}
  }
}

/**
 * exists because it helps with better debugging
 *
 * @param {string} path to file
 */
async function exists(fsPath: string): Promise<boolean> {
  try {
    core.debug(`checking ${fsPath}`)
    await stat(fsPath)
  } catch (err) {
    core.debug(err)
    if (err.code === 'ENOENT') {
      return false
    }
    throw err
  }
  return true
}

/**
 * Parse For Issue URL's
 *
 * @param {string[]} body the issue body to parse
 */
function parseURLs(body: string[]): string[] {
  const giturls: string[] = []
  let begin = false
  for (const line of body) {
    if (new RegExp('^/issuescreate.*').test(line)) {
      begin = true
      continue
    }
    if (begin && !new RegExp('^/endissuescreate.*').test(line)) {
      giturls.push(line)
    } else {
      break
    }
  }
  return giturls
}

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
  const message: string = args.length > 1 ? args.join(' ') : args[0]
  const scriptTemplates = path.resolve(`${basepath}/.github/workflows/ISSUE_TEMPLATE`)
  const fspec = path.resolve(`${scriptTemplates}/${message}`).trim()
  let body

  // a little debuging info
  core.debug(message)
  core.debug(basepath)
  core.debug(scriptTemplates)
  core.debug(fspec)

  // get the template conents if the message points to a path
  core.info(`${fspec} --> ${await exists(fspec)}`)
  if (await exists(fspec)) {
    core.info(`working with template: ${fspec}`)
    body = fs.readFileSync(fspec, 'utf8')
  } else {
    core.info(`working with message: ${message}`)
    body = message
  }

  // Get the list of repos from the current issue
  let comment = ''
  // eslint-disable-next-line @typescript-eslint/camelcase
  const issueUrl = (await client.issues.get({owner, repo, issue_number: issueNumber})).data.html_url
  body = `${body}<br><br> - [Tracking Issue](${issueUrl})`
  //TODO: extract the issue title from the body if one exist otherwise set a default
  const giturls: string[] = parseURLs(issueBody)
  for (const url of giturls) {
    // create new issue from body on nwo
    const nwo: NWO = getnwo(url)
    if (nwo.name !== '' && nwo.owner !== '') {
      // lets make that issue
      const issue = await client.issues.create({
        owner: nwo.owner,
        repo: nwo.name,
        title: 'Behest Issue Creation',
        body
      })
      comment = `${comment}- Issue Rereferenc for [\`${nwo.owner}/${nwo.name}\`](${issue.data.html_url})<br>`
    } else {
      comment = `${comment}- Unable to create issue for ${url}<br>`
    }
  }
  // comment with existing issue link (we can just use the comment body)
  // eslint-disable-next-line @typescript-eslint/camelcase
  await client.issues.createComment({owner, repo, issue_number: issueNumber, body: comment})
}
