import * as path from 'path'
import * as fs from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as utils from '../utils'
import CommandContext from './context'

/**
 * We need a list of issues from the current issue
 */
function getIssuesList(): string[] {
  return []
}

/**
 * We need to filter all the issues for a given list of repos
 */
function getFilterIssues(repolist: string[]): string[] {
  return []
}

/**
 * We need to post an issue comment for each issuelist
 */
function getPostComment(issuelist: string[]): string[] {
  return []
}


/**
 * Get a list of issues from the current issue and post a comment
 *
 * @param {CommandContext} context context for this command execution
 * @param {args} list of arguments
 */
export default async function issuescomment(
  {client, owner, repo, issueNumber, issueBody, basepath}: CommandContext,
  ...args: string[]
): Promise<void> {
  const message: string = args.length > 1 ? args.join(' ') : args[0]
  let body

  // a little debuging info
  core.debug(message)
  core.debug(basepath)
  core.debug(`/issuescomment working with ${message}`)
  const res: string = await utils.getLinkedIssues({owner, repo, issue_number: issueNumber})
  core.debug(`LinkedIssues -> ${res}`)

  // get the template conents if the message points to a path
  // core.info(`${fspec} --> ${await utils.exists(fspec)}`)
  // if (await utils.exists(fspec)) {
  //   core.info(`working with template: ${fspec}`)
  //   body = fs.readFileSync(fspec, 'utf8')
  // } else {
  //   core.info(`working with message: ${message}`)
  //   body = message
  // }

  // let comment = ''
  // // get url from issue
  // // eslint-disable-next-line @typescript-eslint/camelcase
  // const issueUrl: string = await utils.getIssueHtmlUrl({owner, repo, issue_number: issueNumber})
  // body = `${body}\n\n- [Tracking issue in \`${owner}/${repo}\`](${issueUrl})`

  // //extract the issue title from the body if one exist otherwise set a default
  // const title = getTitleFromBody(body)
  // const giturls: string[] = utils.parseExtraArgs(issueBody, 'issuescreate')

  // // Get the list of repos from the current issue
  // for (const url of giturls) {
  //   // create new issue from body on nwo
  //   const nwo: utils.NWO = utils.getNWO(url)
  //   if (nwo.name !== '' && nwo.owner !== '') {
  //     // lets make that issue
  //     core.debug(`creating issue on repo -> ${nwo.owner}/${nwo.name}`)
  //     comment = `${comment}${await CreateIssue(nwo, title, body)}`
  //   } else {
  //     comment = `${comment}- Unable to create issue for ${url}\n`
  //     core.debug(`bad ${nwo.owner}/${nwo.name} unable to create issue for ${url}`)
  //   }
  // }
  // // comment with existing issue link (we can just use the comment body)
  // // eslint-disable-next-line @typescript-eslint/camelcase
  // await client.issues.createComment({owner, repo, issue_number: issueNumber, body: comment})
}
