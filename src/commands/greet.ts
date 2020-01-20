import * as github from '@actions/github'

interface GreetArgs {
  context: {
    client: github.GitHub
    owner: string
    repo: string
    issueNumber: number
  }
  username: string
}

export default async function greet({context: {client, owner, repo, issueNumber}, username}: GreetArgs): Promise<void> {
  const body = `:wave: Hey @${username}!`

  // eslint-disable-next-line @typescript-eslint/camelcase
  await client.issues.createComment({owner, repo, issue_number: issueNumber, body})
}
