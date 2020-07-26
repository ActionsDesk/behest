import * as core from '@actions/core'
import * as github from '@actions/github'
import commands from './commands'

export default async function main(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    const adminToken = core.getInput('admin_token', {required: true})
    const serializedTeams = core.getInput('teams')
    const repository = process.env.GITHUB_REPOSITORY

    if (!repository) {
      throw new Error('GITHUB_REPOSITORY not found in environment variables!')
    }

    if (!github.context.payload.issue) {
      throw new Error('GitHub Issue payload not found')
    }

    const {number} = github.context.payload.issue
    const client = new github.GitHub(token)
    const adminClient = new github.GitHub(adminToken)

    const [owner, repo] = repository?.split('/')
    const {comment} = github.context.payload
    if (comment.body.startsWith('/')) {
      const user = comment.user.login
      const parts: string[] = comment.body.split(/\n/)[0].split(/\s+/) // just the args from the first line
      const command = parts[0].substring(1)
      const args = parts.slice(1) // the rest of the line is args
      const teams = serializedTeams
        .split(/\s+/)
        .filter(item => typeof item === 'string' && item.length)
        .map(item => item.trim())

      core.debug(`commands available: [${Object.keys(commands).join(', ')}]`)
      core.debug(`running ${command}(${args})`)

      commands[command](
        {
          client,
          adminClient,
          user,
          teams,
          owner,
          repo,
          issueNumber: number,
          issueBody: comment.body.split(/\n/),
          basepath: '.'
        },
        ...args
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  main()
}
