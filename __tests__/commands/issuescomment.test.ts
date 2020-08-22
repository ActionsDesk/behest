/* globals describe expect jest test */

import * as github from '@actions/github'
import issuescomment from '../../src/commands/issuescomment'

jest.mock('@actions/core')
jest.mock('@actions/github')

const GetIssueResponse = require('../fixtures/GetIssueResponse.json')
const CreateIssueResponse = require('../fixtures/CreateIssueResponse.json')

const client = new github.GitHub('dummy-token')
const adminClient = new github.GitHub('dummy-token')

const context = {
  adminClient,
  client,
  user: 'mona',
  teams: ['avengers'],
  owner: 'a',
  repo: 'b',
  issueNumber: 1,
  issueBody: ['/issuescomment','https://github.com/foo/bar','https://github.com/c/d', '/endissuescomment'],
  basepath: './__tests__/fixtures/issues'
}

describe('issuescomment', () => {
  test('issues comment with message', async () => {
    const mockGetIssue = jest.spyOn(client.issues, 'get')
    const mockCreateComment = jest.spyOn(client.issues, 'createComment')
    const mockCreate = jest.spyOn(client.issues, 'create')

    mockCreate.mockImplementation(() => CreateIssueResponse)
    mockGetIssue.mockImplementation(() => GetIssueResponse)

    await issuescomment(context, ":wave: Hey @mona! This comment is working <br><br> :tada: :tada:")

    // expect(mockCreateComment.mock.calls.length).toEqual(1)
    // expect(mockCreateComment.mock.calls[0][0]).toEqual({
    //   owner: context.owner,
    //   repo: context.repo,
    //   // eslint-disable-next-line @typescript-eslint/camelcase
    //   issue_number: context.issueNumber,
    //   body: "- Issue Reference for [`foo/bar`](https://github.com/foo/bar/issues/1347)\n- Issue Reference for [`c/d`](https://github.com/foo/bar/issues/1347)\n"
    // })
    // expect(mockCreate.mock.calls.length).toEqual(2)
    // expect(mockCreate.mock.calls[0][0]).toEqual({
    //   owner: 'foo',
    //   repo: 'bar',
    //   title: 'Issues Create Action for foo/bar',
    //   body: ":wave: Hey @mona! It's working <br><br> :tada: :tada:\n\n- [Tracking issue in `a/b`](https://github.com/foo/bar/issues/1347)"
    // })
    // expect(mockCreate.mock.calls[1][0]).toEqual({
    //   owner: 'c',
    //   repo: 'd',
    //   title: 'Issues Create Action for c/d',
    //   body: ":wave: Hey @mona! It's working <br><br> :tada: :tada:\n\n- [Tracking issue in `a/b`](https://github.com/foo/bar/issues/1347)"
    // })
  })

})
