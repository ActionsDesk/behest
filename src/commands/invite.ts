import * as github from '@actions/github'

export interface InviteArgs {
  context: {
    client: github.GitHub
    adminClient: github.GitHub
    owner: string
    repo: string
    issueNumber: number
  }
  username: string
  email: string
}

export default async function invite({
  context: {adminClient, client, owner, repo, issueNumber},
  username,
  email
}: InviteArgs): Promise<void> {
  let subject
  if (username) {
    subject = username
    const userResponse = await client.users.getByUsername({username})

    // eslint-disable-next-line @typescript-eslint/camelcase
    await adminClient.orgs.createInvitation({org: owner, invitee_id: userResponse.data.id})
  } else if (email) {
    subject = email
    await adminClient.orgs.createInvitation({org: owner, email})
  } else {
    throw new Error('username or email is required')
  }

  await client.issues.createComment({
    owner,
    repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: issueNumber,
    body: `${subject} has been invited!`
  })
}
