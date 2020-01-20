/* globals describe expect jest test */

import * as github from '@actions/github'
import greet from '../../src/commands/greet'

jest.mock('@actions/core')
jest.mock('@actions/github')

const client = new github.GitHub('dummy-token')
const adminClient = new github.GitHub('dummy-token')

const context = {
  adminClient,
  client,
  user: 'mona',
  owner: 'a',
  repo: 'b',
  issueNumber: 1
}

describe('greet', () => {
  test('greets a user', async () => {
    await greet(context, 'mona')

    const mockCreateComment = jest.spyOn(client.issues, 'createComment')

    expect(mockCreateComment.mock.calls.length).toEqual(1)
    expect(mockCreateComment.mock.calls[0][0]).toEqual({
      owner: context.owner,
      repo: context.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issueNumber,
      body: `:wave: Hey @mona!`
    })
  })
})
