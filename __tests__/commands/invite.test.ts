/* globals describe expect jest test */

import * as github from '@actions/github'
import invite from '../../src/commands/invite'

const UsersGetByUsernameResponse = require('../fixtures/UsersGetByUsernameResponse.json')
const OrgsGetMembershipAdminResponse = require('../fixtures/OrgsGetMembershipResponse.admin.json')
const OrgsGetMembershipMemberResponse = require('../fixtures/OrgsGetMembershipResponse.member.json')
const TeamsGetMembershipInOrg = require('../fixtures/TeamsGetMembershipInOrg.json')

jest.mock('@actions/core')
jest.mock('@actions/github')

const client = new github.GitHub('dummy-token')
const adminClient = new github.GitHub('dummy-token')

const context = {
  adminClient,
  client,
  user: 'mona',
  teams: ['avengers'],
  owner: 'a',
  repo: 'b',
  issueNumber: 1
}

describe('invite', () => {
  test('invites by username', async () => {
    const mockGetByUsername = jest.spyOn(client.users, 'getByUsername')
    const mockCreateInvitation = jest.spyOn(adminClient.orgs, 'createInvitation')
    const mockGetMembership = jest.spyOn(adminClient.orgs, 'getMembership')
    const mockGetMembershipInOrg = jest.spyOn(adminClient.teams, 'getMembershipInOrg')

    mockGetByUsername.mockImplementation(() => UsersGetByUsernameResponse)
    mockGetMembership.mockImplementation(() => OrgsGetMembershipAdminResponse)
    mockGetMembershipInOrg.mockImplementation(() => TeamsGetMembershipInOrg)

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
    const mockGetMembershipInOrg = jest.spyOn(adminClient.teams, 'getMembershipInOrg')

    mockGetMembershipInOrg.mockImplementation(() => TeamsGetMembershipInOrg)

    await invite(context, 'mona@example.com')

    expect(mockCreateInvitation.mock.calls.length).toEqual(1)
    expect(mockCreateInvitation.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      email: 'mona@example.com'
    })
  })

  test('allows non-admin in team to execute', async () => {
    const mockGetByUsername = jest.spyOn(client.users, 'getByUsername')
    const mockCreateInvitation = jest.spyOn(adminClient.orgs, 'createInvitation')
    const mockGetMembership = jest.spyOn(adminClient.orgs, 'getMembership')
    const mockGetMembershipInOrg = jest.spyOn(adminClient.teams, 'getMembershipInOrg')

    mockGetByUsername.mockImplementation(() => UsersGetByUsernameResponse)
    mockGetMembership.mockImplementation(() => OrgsGetMembershipMemberResponse)
    mockGetMembershipInOrg.mockImplementation(() => TeamsGetMembershipInOrg)

    await invite(context, 'mona')

    expect(mockCreateInvitation.mock.calls.length).toEqual(1)
    expect(mockCreateInvitation.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      invitee_id: UsersGetByUsernameResponse.data.id
    })
  })

  test('throws on non-admin, non-team member attempts', async () => {
    const mockGetByUsername = jest.spyOn(client.users, 'getByUsername')
    const mockCreateInvitation = jest.spyOn(adminClient.orgs, 'createInvitation')
    const mockGetMembership = jest.spyOn(adminClient.orgs, 'getMembership')
    const mockGetMembershipInOrg = jest.spyOn(adminClient.teams, 'getMembershipInOrg')

    mockGetByUsername.mockImplementation(() => UsersGetByUsernameResponse)
    mockGetMembership.mockImplementation(() => OrgsGetMembershipMemberResponse)

    await invite(context, 'mona')

    expect(mockCreateInvitation.mock.calls.length).toEqual(1)
    expect(mockCreateInvitation.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      invitee_id: UsersGetByUsernameResponse.data.id
    })
  })
})
