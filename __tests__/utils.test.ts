jest.mock('@actions/github')
const {GitHub, context} = require('@actions/github')

import * as fs from 'fs'
import * as utils from '../src/utils'

const GetIssueResponse = require('./fixtures/GetIssueResponse.json')
const GetIssueTimelineResponse = require('./fixtures/GetIssueTimelineResponse.json')
const client = new GitHub('dummy-token')

function getRandomNumber(): Number {
  return Math.floor(Math.random() * 100)
}
describe('utils.js tests', () => {
  beforeEach(() => {
    context.repo = {
      owner: 'owner',
      repo: 'repo'
    }
    process.env.INPUT_TOKEN = 'NOT-A-TOKEN'
    process.env.INPUT_ADMIN_TOKEN = 'NOT-A-TOKEN'
    const github = {
      issues: {
        create: jest.fn().mockReturnValueOnce(getRandomNumber())
      }
    }
    GitHub.mockImplementation(() => github)
  })

  test('returns a GitHub Admin client', async () => {
    const github = utils.getAdminClient()
    expect(github).toBeInstanceOf(Object)
  })

  test('returns a GitHub client', async () => {
    const github = utils.getClient()
    expect(github).toBeInstanceOf(Object)
  })

  test('utils create getnwo no name', async () => {
    const nwo: utils.NWO = utils.getNWO('https://github.com/lslsls')
    expect(nwo).toEqual({
      name: '',
      owner: 'lslsls'
    })
  })

  test('utils create getnwo bad uri', async () => {
    const nwo: utils.NWO = utils.getNWO('lslsls')
    expect(nwo).toEqual({
      name: '',
      owner: ''
    })
  })

  test('utils create getnwo name and owner', async () => {
    const nwo: utils.NWO = utils.getNWO('https://github.com/a/b')
    expect(nwo).toEqual({
      name: 'b',
      owner: 'a'
    })
  })

  test('utils get issue html url', async () => {
    const mockGetIssue = jest.spyOn(client.issues, 'get')
    mockGetIssue.mockImplementation(() => GetIssueResponse)

    const url = await utils.getIssueHtmlUrl({owner: 'a', repo: 'b', issue_number: 5})

    expect(mockGetIssue.mock.calls.length).toEqual(0)
    expect(url).toEqual('https://github.com/a/b/issues/5')
  })

  test('utils parseExtraArgs', async () => {
    const body: string[] = ['/foo command', 'arg1', 'arg2', '/endfoo']
    const result: string[] = utils.parseExtraArgs(body, 'foo')
    expect(result).toEqual(['arg1', 'arg2'])
  })

  test('utils parseExtraArgs with no ending', async () => {
    const body: string[] = ['/foo command', 'arg1', 'arg2']
    const result: string[] = utils.parseExtraArgs(body, 'foo')
    expect(result).toEqual(['arg1', 'arg2'])
  })

  test('utils parseExtraArgs with no arguments', async () => {
    const body: string[] = ['/foo command']
    const result: string[] = utils.parseExtraArgs(body, 'foo')
    expect(result).toEqual([])
  })

  test('utils parseExtraArgs with no extra message after ending', async () => {
    const body: string[] = ['/foo command', 'arg1', 'arg2', '/endfoo', 'extra message']
    const result: string[] = utils.parseExtraArgs(body, 'foo')
    expect(result).toEqual(['arg1', 'arg2'])
  })

  test('utils parse out yaml from body', async () => {
    const body: string = '---\n' + 'name: some name\n' + 'foo: bar\n' + '\n' + '---\n' + '\n' + '# more text\n'
    const o = utils.parseYamlFromText(body)
    expect(o).toBeInstanceOf(Object)
    expect(o.name).toEqual('some name')
    expect(o.foo).toEqual('bar')
  })

  test('utils parse out the body from yaml', async () => {
    const body: string =
      '---\n' + 'name: some name\n' + 'foo: bar\n' + '\n' + '---\n' + '\n# more text\n' + 'this is a message\n<br>'
    const subbody: string = utils.parseBodyFromText(body)
    expect(subbody).toEqual('\n# more text\nthis is a message\n<br>')
  })

  test('utils parse out yaml from body when no yaml', async () => {
    const body: string = '# more text\n'
    const o = utils.parseYamlFromText(body)
    expect(o).toEqual(null)
  })

  test('utils parse out the body from yaml when no yaml', async () => {
    const body: string = '\n# more text\n' + 'this is a message\n<br>'
    const subbody: string = utils.parseBodyFromText(body)
    expect(subbody).toEqual('\n# more text\nthis is a message\n<br>')
  })

  // this is a test for that for sapces at end of yaml
  test('utils parse out the body with cleaned yaml', async () => {
    // const body: string = ''
    const body = fs.readFileSync('./__tests__/fixtures/issues/.github/workflows/ISSUE_TEMPLATE/template2.md', 'utf8')

    const expects: string =
      '\n' + '# Project #3 Message with $SERVICE\n' + '\n' + '👋🏼 Greetings,  🎉\n' + '\n' + '### Why me?\n'
    expect(utils.parseBodyFromText(body)).toEqual(expects)
  })

  // test getLinkedIssues
  // TODO: fix mocking ::warning::TypeError: client.issues.listEventsForTimeline is not a function
  //        it's calling a generator, and this needs to figure out how to do that
  test('utils getLinkedIssues', async () => {
    const mockGetIssueTimeline = jest.spyOn(client.issues, 'listEventsForTimeline')
    mockGetIssueTimeline.mockImplementation(() => GetIssueTimelineResponse)

    const url = await utils.getLinkedIssues({owner: 'a', repo: 'b', issue_number: 5}, {nwo: []})

    expect(mockGetIssueTimeline.mock.calls.length).toEqual(0)
    expect(url.length).toEqual(0)
  })

  // test unique
  test('unique', async () => {
    let result: string[] = utils.unique(['a', 'a', 'b', 'c'])
    expect(result.length).toEqual(3)
    expect(result).toEqual(['a', 'b', 'c'])

    // little more complicated
    result = utils.unique([
      'https://github.com/github/foo/issues/1',
      'https://github.com/github/foo/issues/1',
      'https://github.com/github/foo/issues/2',
      'https://github.com/github/foo/issues/2',
      'https://github.com/github/foo/issues/3',
      'https://github.com/github/foo/issues/3'
    ])
    expect(result.length).toEqual(3)
    expect(result).toEqual([
      'https://github.com/github/foo/issues/1',
      'https://github.com/github/foo/issues/2',
      'https://github.com/github/foo/issues/3'
    ])

    // deal with empty arrays
    result = utils.unique([])
    expect(result.length).toEqual(0)
    expect(result).toEqual([])
  })

  // test getIssueNumberFromURL
  test('test getIssueNumberFromURL', async () => {
    expect(utils.getIssueNumberFromURL('https://github.com/mona/test-repo-0/issues/12')).toEqual(12)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/test-repo-0/issues/9')).toEqual(9)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/test-repo-0/issues/10')).toEqual(10)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/test-repo-0/issues/901')).toEqual(901)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/test-repo-0/issues/1')).toEqual(1)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/test-repo-0/issues/')).toEqual(-1)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/test-repo-0/issue/1')).toEqual(-1)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/issue/1')).toEqual(-1)
    expect(utils.getIssueNumberFromURL('https://github.com/mona/issues/1')).toEqual(-1)
    expect(utils.getIssueNumberFromURL('https://github.com/issues/1')).toEqual(-1)
    expect(utils.getIssueNumberFromURL('https://issues/1')).toEqual(-1)
  })
})
