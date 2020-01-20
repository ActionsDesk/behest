import * as github from '@actions/github'

export default interface Context {
  adminClient: github.GitHub
  client: github.GitHub
  user: string
  owner: string
  repo: string
  issueNumber: number
}
