/* globals describe expect jest test */

import * as core from '@actions/core'
import * as github from '@actions/github'
import main from '../src/main'

jest.mock('@actions/github')

describe('main', () => {
  test('runs', () => {
    process.env.INPUT_TOKEN = 'a'
    process.env.INPUT_ADMIN_TOKEN = 'a'
    process.env.GITHUB_REPOSITORY = 'a/b'

    const mockSetFailed = jest.spyOn(core, 'setFailed')
    github.context.payload = {comment: {body: '', user: {login: 'mona'}}, issue: {number: 1}}

    function run() {
      return main()
    }

    expect(run).not.toThrow()
    expect(mockSetFailed.mock.calls.length).toEqual(0)
  })
})
