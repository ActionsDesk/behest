import * as core from '@actions/core'
import * as github from '@actions/github'
import commands from './commands'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    const adminToken = core.getInput('admin_token', {required: true})
    const repository = process.env.GITHUB_REPOSITORY

    if (!repository) {
      throw new Error('GITHUB_REPOSITORY not found in environment variables')
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
      const parts: string[] = comment.body.split(/\s+/)
      const command = parts[0]
      const args = parts.slice(1)

      commands[command]({client, adminClient, owner, repo, issueNumber: number}, ...args)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
