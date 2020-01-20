/* globals describe expect jest test */

import * as github from '@actions/github'
import invite from '../../src/commands/invite'

const UsersGetByUsernameResponse = require('../fixtures/UsersGetByUsernameResponse.success.json')
const OrgsGetMembershipResponse = require('../fixtures/OrgsGetMembershipResponse.success.json')

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

describe('invite', () => {
  test('invites by username', async () => {
    const mockGetByUsername = jest.spyOn(client.users, 'getByUsername')
    const mockCreateInvitation = jest.spyOn(adminClient.orgs, 'createInvitation')
    const mockGetMembership = jest.spyOn(adminClient.orgs, 'getMembership')

    mockGetByUsername.mockImplementation(() => UsersGetByUsernameResponse)
    mockGetMembership.mockImplementation(() => OrgsGetMembershipResponse)

    await invite(context, 'mona')

    expect(mockCreateInvitation.mock.calls.length).toEqual(1)
    expect(mockCreateInvitation.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      invitee_id: UsersGetByUsernameResponse.data.id
    })
  })

  test('invites by email', async () => {
    const mockCreateInvitation = jest.spyOn(adminClient.orgs, 'createInvitation')

    await invite(context, 'mona@example.com')

    expect(mockCreateInvitation.mock.calls.length).toEqual(1)
    expect(mockCreateInvitation.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      email: 'mona@example.com'
    })
  })
})
