/* globals describe expect jest test */

import * as github from '@actions/github'
import * as ic from '../../src/commands/issuescreate'
import issuescreate from '../../src/commands/issuescreate'

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
  issueBody: ['/issuescreate','https://github.com/foo/bar','https://github.com/c/d', '/endissuescreate'],
  basepath: './__tests__/fixtures/issues'
}

describe('issuescreate', () => {
  test('issues create with message', async () => {
    const mockGetIssue = jest.spyOn(client.issues, 'get')
    const mockCreateComment = jest.spyOn(client.issues, 'createComment')
    const mockCreate = jest.spyOn(client.issues, 'create')

    mockCreate.mockImplementation(() => CreateIssueResponse)
    mockGetIssue.mockImplementation(() => GetIssueResponse)

    await issuescreate(context, ":wave: Hey @mona! It's working <br><br> :tada: :tada:")

    expect(mockCreateComment.mock.calls.length).toEqual(1)
    expect(mockCreateComment.mock.calls[0][0]).toEqual({
      owner: context.owner,
      repo: context.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issueNumber,
      body: "- Issue Rereferenc for [`foo/bar`](https://github.com/foo/bar/issues/1347)<br>- Issue Rereferenc for [`c/d`](https://github.com/foo/bar/issues/1347)<br>"
    })
    expect(mockCreate.mock.calls.length).toEqual(2)
    expect(mockCreate.mock.calls[0][0]).toEqual({
      owner: 'foo',
      repo: 'bar',
      title: 'Behest Issue Creation',
      body: ":wave: Hey @mona! It's working <br><br> :tada: :tada:<br><br> - [Tracking Issue](https://github.com/foo/bar/issues/1347)"
    })
    expect(mockCreate.mock.calls[1][0]).toEqual({
      owner: 'c',
      repo: 'd',
      title: 'Behest Issue Creation',
      body: ":wave: Hey @mona! It's working <br><br> :tada: :tada:<br><br> - [Tracking Issue](https://github.com/foo/bar/issues/1347)"
    })
  })

  test('issues create with template', async () => {
    const mockGetIssue = jest.spyOn(client.issues, 'get')
    const mockCreateComment = jest.spyOn(client.issues, 'createComment')
    const mockCreate = jest.spyOn(client.issues, 'create')

    mockCreate.mockImplementation(() => CreateIssueResponse)
    mockGetIssue.mockImplementation(() => GetIssueResponse)
    await issuescreate(context, "template.md")


    const createIssueExpects = '---\n' +
                  'name: Issue template for some testing\n' +
                  'about: This issue template is used in behest test case\n' +
                  'labels: bug\n' +
                  'title: Test Title for the issue\n' +
                  '\n' +
                  '---\n' +
                  '\n' +
                  '# Body Subject For Issue\n' +
                  '\n' +
                  '👋🏼 Greetings, Pal!<br><br> - [Tracking Issue](https://github.com/foo/bar/issues/1347)'
    const expbody = '- Issue Rereferenc for [`foo/bar`](https://github.com/foo/bar/issues/1347)<br>- Issue Rereferenc for [`c/d`](https://github.com/foo/bar/issues/1347)<br>'

    expect(mockCreateComment.mock.calls.length).toEqual(1)
    expect(mockCreateComment.mock.calls[0][0]).toEqual({
      owner: context.owner,
      repo: context.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issueNumber,
      body : expbody
    })
    expect(mockCreate.mock.calls.length).toEqual(2)
    expect(mockCreate.mock.calls[0][0]).toEqual({
      owner: 'foo',
      repo: 'bar',
      title: 'Behest Issue Creation',
      body: createIssueExpects
    })
    expect(mockCreate.mock.calls[1][0]).toEqual({
      owner: 'c',
      repo: 'd',
      title: 'Behest Issue Creation',
      body: createIssueExpects
    })

  })

  test('issues create getnwo no name', async () => {
    const nwo: ic.NWO = ic.getnwo('https://github.com/lslsls')
    expect(nwo).toEqual({
      name: '',
      owner: 'lslsls'
    })
  })

  test('issues create getnwo bad uri', async () => {
    const nwo: ic.NWO = ic.getnwo('lslsls')
    expect(nwo).toEqual({
      name: '',
      owner: ''
    })
  })

  test('issues create getnwo name and owner', async () => {
    const nwo: ic.NWO = ic.getnwo('https://github.com/a/b')
    expect(nwo).toEqual({
      name: 'b',
      owner: 'a'
    })
  })

})
