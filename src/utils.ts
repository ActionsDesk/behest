import * as fs from 'fs'
import YAML from 'yaml'
import * as github from '@actions/github'
import * as core from '@actions/core'
import {SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION} from 'constants'

export const {stat} = fs.promises

export interface NWO {
  name: string
  owner: string
}

/**
 * Get an Oktokit object using GITHUB_TOKEN
 *
 * @reutrns {GitHub} returns a github object
 */
export function getClient(): github.GitHub {
  const token: string = process.env.INPUT_TOKEN || ''
  core.debug(`trying with regular token -> ${token.length}`)
  const client: github.GitHub = new github.GitHub(token)
  core.debug('returning client')
  return client
}

/**
 * Get an Oktokit object using ADMIN_TOKEN
 *
 * @reutrns {GitHub} returns a github object
 */
export function getAdminClient(): github.GitHub {
  const token: string = process.env.INPUT_ADMIN_TOKEN || ''
  core.debug(`trying with admin token -> ${token.length}`)
  const client: github.GitHub = new github.GitHub(token)
  core.debug('returning client')
  return client
}

/**
 * Get the Issue URL
 *
 * @params {onwer, repo, issue_number} the issue options
 * @reutrns {string} returns a url, defaults to github.com on exceptions
 */
export async function getIssueHtmlUrl(options: {owner: string; repo: string; issue_number: number}): Promise<string> {
  try {
    const client: github.GitHub = getAdminClient()
    const response = await client.issues.get(options)
    return response.data.html_url
  } catch (error) {
    core.debug('unable to get url from issue')
    core.warning(error)
    return `https://github.com/${options.owner}/${options.repo}/issues/${options.issue_number}`
  }
}

/**
 * Get list of linked issues
 * @param {owner, repo, issue_number}  the issue options
 * @returns {string[]}
 */
export async function getLinkedIssues(
  options: {owner: string; repo: string; issue_number: number},
  filter: {nwo: string[]}
): Promise<string[]> {
  try {
    const client: github.GitHub = getAdminClient()

    const linkedIssues: string[] = []
        const events = await client.issues
          .listEventsForTimeline({
            owner: options.owner,
            repo: options.repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            issue_number: options.issue_number
          })

        // issues is an array of all issue objects
        core.debug(`${events}`)
        for (const event of events.data) {
          if (event.event === 'cross-referenced') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = event
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item: any = data.source
            if (item.type === 'issue' && item.issue.pull_request === undefined) {
              const issueNWO = item.issue.repository.full_name
              if (filter.nwo.length === 0 || filter.nwo.includes(issueNWO)) {
                const issueURL = item.issue.html_url
                linkedIssues.push(issueURL)
              }
          }
        }
      }
    return linkedIssues
  } catch (error) {
    core.debug(`unable to listEvents from: ${options.owner}/${options.repo}/issues/${options.issue_number}`)
    core.warning(error)
    return []
  }
}

/**
 * get a name with owner
 *
 * @param {string} git url
 * @reutrns {NWO} name with owner interface
 */
export function getNWO(uri: string): NWO {
  try {
    core.debug(`getnwo for ${uri}`)
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
export async function exists(fsPath: string): Promise<boolean> {
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
 * get extra args from body in between / commands or to the end
 *
 * @param {string[]} body the issue body to parse
 * @param {string} the command to parse the body for
 * @retruns {string[]} the extra args
 */
export function parseExtraArgs(body: string[], command: string): string[] {
  const extraargs: string[] = []
  let begin = false
  for (const line of body) {
    if (new RegExp(`^/${command}.*`).test(line)) {
      begin = true
      continue
    }
    if (begin && !new RegExp(`^/end${command}.*`).test(line)) {
      extraargs.push(line)
    } else {
      break
    }
  }
  return extraargs
}

/**
 * parse yaml from a string body
 *
 * @param {string} the body to parse
 * @retruns {YAML} returns the first document found
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async, @typescript-eslint/no-explicit-any
export function parseYamlFromText(body: string): any {
  let result = JSON.parse('{}')
  try {
    const yamls: YAML.Document[] = YAML.parseAllDocuments(body)
    for (const y of yamls) {
      result = y.toJSON()
      break
    }
    return result
  } catch (error) {
    core.debug('Unable to parse yaml from body')
    core.warning(error)
    return result
  }
}

/**
 * parse the body string from body
 *
 * @param {string} the body to parse
 * @retruns {string} returns a string
 */
export function parseBodyFromText(body: string): string {
  return body.replace(/.*---\n[^)]*---\n.*/g, '')
}

/**
 * get a unique list
 * @param {string[]} the array to make unique
 * @returns {string[]} the unique list
 */
export function unique(input: string[]): string[] {
  return input.filter((item, i, ar) => ar.indexOf(item) === i)
}

/**
 * get issue number from url
 * @param {string} the url to parse
 * @return {number} a number for the issue
 */
export function getIssueNumberFromURL(issueURL: string): number {
  let issueNumber = -1
  const issueMatch = issueURL.match(/https:\/\/.*\/(.*)\/(.*)\/issues\/(\d+)/i)
  if (issueMatch instanceof Array) {
    try {
      issueNumber = new Number(issueMatch[issueMatch.length - 1]).valueOf()
    } catch (error) {
      core.warning(`Unable to extract issue number from url -> ${issueURL}`)
      core.error(error)
    }
  }
  return issueNumber
}
