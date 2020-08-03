/* globals describe expect jest test */

import * as github from '@actions/github'
import kick from '../../src/commands/kick'

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
  user: 'Chocrates',
  teams: ['avengers'],
  owner: 'a',
  repo: 'b',
  issueNumber: 1,
  issueBody: [],
  basepath: '.'
}

describe('kick', () => {
  test('kicks by username kicks outside collaborator', async () => {
    const mockGetByUsername = jest.spyOn(client.users, 'getByUsername')
    const mockRemoveUser = jest.spyOn(adminClient.orgs, 'removeOutsideCollaborator')
    const mockGetMembership = jest.spyOn(adminClient.orgs, 'getMembership')
    const mockGetMembershipInOrg = jest.spyOn(adminClient.teams, 'getMembershipInOrg')

    mockGetByUsername.mockImplementation(() => UsersGetByUsernameResponse)
    mockGetMembership.mockImplementation(() => OrgsGetMembershipAdminResponse)
    mockGetMembershipInOrg.mockImplementation(() => TeamsGetMembershipInOrg)

    await kick(context, 'mona')

    expect(mockRemoveUser.mock.calls.length).toEqual(1)
    expect(mockRemoveUser.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      username: 'mona'
    })
  })

  test('kicks by username kicks member', async () => {
    const mockGetByUsername = jest.spyOn(client.users, 'getByUsername')
    const mockRemoveCollaborator = jest.spyOn(adminClient.orgs, 'removeOutsideCollaborator')
    const mockRemoveUser = jest.spyOn(adminClient.orgs, 'removeMembership')
    const mockGetMembership = jest.spyOn(adminClient.orgs, 'getMembership')
    const mockGetMembershipInOrg = jest.spyOn(adminClient.teams, 'getMembershipInOrg')

    mockGetByUsername.mockImplementation(() => UsersGetByUsernameResponse)
    mockGetMembership.mockImplementation(() => OrgsGetMembershipAdminResponse)
    mockGetMembershipInOrg.mockImplementation(() => TeamsGetMembershipInOrg)
    class FetchError extends Error {
      status: number;
      constructor(status:number, message: string) {
        super(message);
        this.status = status;
        this.name = 'FetchError';
      }
    }
    mockRemoveCollaborator.mockImplementation(() => {
      return Promise.reject(new FetchError(422, 'User is not an outside collaborator!'))
    })

    await kick(context, 'mona')

    expect(mockRemoveCollaborator.mock.calls.length).toEqual(1)
    expect(mockRemoveCollaborator.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      username: 'mona'
    })

    expect(mockRemoveUser.mock.calls.length).toEqual(1)
    expect(mockRemoveUser.mock.calls[0][0]).toEqual({
      org: context.owner,
      // eslint-disable-next-line @typescript-eslint/camelcase
      username: 'mona'
    })
  })


  test('kick by email fails', async () => {
    const mockRemoveUser = jest.spyOn(adminClient.orgs, 'createInvitation')
    const mockGetMembershipInOrg = jest.spyOn(adminClient.teams, 'getMembershipInOrg')

    mockGetMembershipInOrg.mockImplementation(() => TeamsGetMembershipInOrg)
    await expect(kick(context, 'mona@example.com')).rejects.toThrowError('username is required');
  })
})
