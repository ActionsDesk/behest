import * as path from 'path'
import * as fs from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as utils from '../utils'
import CommandContext from './context'

/**
 * get the title from the body
 * Otherwise returns the default issues body title
 *
 * @param {body} issue body
 * @returns {string} a title
 */
function getTitleFromBody(body: string): string {
  const result = 'Issues Create Action'
  const json = utils.parseYamlFromText(body)
  if (json === null) {
    return result
  } else {
    try {
      return json.title === undefined ? result : json.title
    } catch {
      return result
    }
  }
}

/**
 * create an issue and continue on failure
 *
 * @param {utils.NWO} name with owner
 * @param {string} title for the issue
 * @param {body} issue body
 * @returns {string} a message to capture
 */
async function CreateIssue(nwo: utils.NWO, title: string, body: string): Promise<string> {
  try {
    body = utils.parseBodyFromText(body)
    // normal token would not have issues access to other repos
    const octokit: github.GitHub = utils.getAdminClient()
    const issue = await octokit.issues.create({
      title: `${title} for ${nwo.owner}/${nwo.name}`,
      body,
      owner: nwo.owner,
      repo: nwo.name
      // assignees: getElements(assignees),
      // labels: getElements(labels)
    })
    core.info(`New issue created ${issue.data.number}`)
    return `- Issue Reference for [\`${nwo.owner}/${nwo.name}\`](${issue.data.html_url})\n`
  } catch (error) {
    core.error(error)
    return `- Error in creating issue for \`${nwo.owner}/${nwo.name}\` [${error}]\n`
  }
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
  core.info(`${fspec} --> ${await utils.exists(fspec)}`)
  if (await utils.exists(fspec)) {
    core.info(`working with template: ${fspec}`)
    body = fs.readFileSync(fspec, 'utf8')
  } else {
    core.info(`working with message: ${message}`)
    body = message
  }

  let comment = ''
  // get url from issue
  // eslint-disable-next-line @typescript-eslint/camelcase
  const issueUrl: string = await utils.getIssueHtmlUrl({owner, repo, issue_number: issueNumber})
  body = `${body}\n\n- [Tracking issue in \`${owner}/${repo}\`](${issueUrl})`

  //extract the issue title from the body if one exist otherwise set a default
  const title = getTitleFromBody(body)
  const giturls: string[] = utils.parseExtraArgs(issueBody, 'issuescreate')

  // Get the list of repos from the current issue
  for (const url of giturls) {
    // create new issue from body on nwo
    const nwo: utils.NWO = utils.getNWO(url)
    if (nwo.name !== '' && nwo.owner !== '') {
      // lets make that issue
      core.debug(`creating issue on repo -> ${nwo.owner}/${nwo.name}`)
      comment = `${comment}${await CreateIssue(nwo, title, body)}`
    } else {
      comment = `${comment}- Unable to create issue for ${url}\n`
      core.debug(`bad ${nwo.owner}/${nwo.name} unable to create issue for ${url}`)
    }
  }
  // comment with existing issue link (we can just use the comment body)
  // eslint-disable-next-line @typescript-eslint/camelcase
  await client.issues.createComment({owner, repo, issue_number: issueNumber, body: comment})
}
