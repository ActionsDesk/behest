/* globals describe expect jest test */

import * as github from '@actions/github'
import issuescreate from '../../src/commands/issuescreate'

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
  issueNumber: 1,
  issueBody: ['/issuescreate','url','url1', '/endissuescreate'],
  basepath: './__tests__/fixtures/issues'
}

describe('issuescreate', () => {
  test('issues create with message', async () => {
    await issuescreate(context, ":wave: Hey @mona! It's working <br><br> :tada: :tada:")

    const mockCreateComment = jest.spyOn(client.issues, 'createComment')

    expect(mockCreateComment.mock.calls.length).toEqual(1)
    expect(mockCreateComment.mock.calls[0][0]).toEqual({
      owner: context.owner,
      repo: context.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issueNumber,
      body: `:wave: Hey @mona! It's working <br><br> :tada: :tada:<br>url<br>url1<br>/endissuescreate<br>`
    })
  })

  test('issues create with template', async () => {
    await issuescreate(context, "template.md")

    const mockCreateComment = jest.spyOn(client.issues, 'createComment')

    let expbody = '---\n' +
                  'name: Issue template for some testing\n' +
                  'about: This issue template is used in behest test case\n' +
                  'labels: bug\n' +
                  'title: Test Title for the issue\n' +
                  '\n' +
                  '---\n' +
                  '\n' +
                  '# Body Subject For Issue\n' +
                  '\n' +
                  '👋🏼 Greetings, Pal!<br>url<br>url1<br>/endissuescreate<br>' 

    expect(mockCreateComment.mock.calls.length).toEqual(1)
    expect(mockCreateComment.mock.calls[0][0]).toEqual({
      owner: context.owner,
      repo: context.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: context.issueNumber,
      body : expbody
    })

  })

})
