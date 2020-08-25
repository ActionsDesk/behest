/* globals describe expect jest test */

import * as github from '@actions/github'
import issuescomment from '../../src/commands/issuescomment'

jest.mock('@actions/core')
jest.mock('@actions/github')

const GetIssueTimelineResponse = require('./../fixtures/GetIssueTimelineResponse.json')

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
    const mockCreateComment = jest.spyOn(client.issues, 'createComment')
    const mockGetIssueTimeline = jest.spyOn(client.issues, 'listEventsForTimeline')

    mockGetIssueTimeline.mockImplementation(() => GetIssueTimelineResponse)

    await issuescomment(context, ":wave: Hey @mona! This comment is working <br><br> :tada: :tada:")

    //TODO: fix test to have right mocks
    expect(mockCreateComment.mock.calls.length).toEqual(0)
  })

})
