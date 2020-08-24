/* globals describe expect jest test */

import * as github from '@actions/github'
import main from '../src/main'

/**
 * This is mostly a copy of main.test.ts however for debugging runs
 * use vs code Attach method for debuging and npm run debug
 */
describe('main debug', () => {
  test('runs', () => {
    process.env.INPUT_TOKEN = process.env.GITHUB_TOKEN
    process.env.INPUT_ADMIN_TOKEN = process.env.GITHUB_TOKEN
    process.env.GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY === undefined ? 'a/b' : process.env.GITHUB_REPOSITORY
    const username = process.env.GITHUB_USERNAME === undefined ? 'mona' : process.env.GITHUB_USERNAME
    const issueNumber = new Number(
      process.env.GITHUB_ISSUE_NUMBER === undefined ? new Number(1) : process.env.GITHUB_ISSUE_NUMBER
    )

    github.context.payload = {comment: {body: '', user: {login: username}}, issue: {number: issueNumber.valueOf()}}

    function run() {
      return main()
    }

    expect(run).not.toThrow()
  })

  test('runs issuescreate', () => {
    process.env.INPUT_TOKEN = process.env.GITHUB_TOKEN
    process.env.INPUT_ADMIN_TOKEN = process.env.GITHUB_TOKEN
    process.env.GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY === undefined ? 'a/b' : process.env.GITHUB_REPOSITORY

    const default_args = 'foo message\nhttp://url1\nhttp://url2\n/'
    let args = process.env.TEST_COMMAND === undefined ? default_args : process.env.TEST_COMMAND
    const username = process.env.GITHUB_USERNAME === undefined ? 'mona' : process.env.GITHUB_USERNAME
    const issueNumber = new Number(
      process.env.GITHUB_ISSUE_NUMBER === undefined ? new Number(1) : process.env.GITHUB_ISSUE_NUMBER
    )

    github.context.payload = {
      comment: {body: `/issuescreate ${args}/endissuescreate`, user: {login: username}},
      issue: {number: issueNumber.valueOf()}
    }

    function run() {
      return main()
    }

    expect(run).not.toThrow()
  })

  test('runs issuescomment', () => {
    process.env.INPUT_TOKEN = process.env.GITHUB_TOKEN
    process.env.INPUT_ADMIN_TOKEN = process.env.GITHUB_TOKEN
    process.env.GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY === undefined ? 'a/b' : process.env.GITHUB_REPOSITORY

    const default_args = 'foo message\nhttp://url1\nhttp://url2\n'
    let args = process.env.TEST_COMMAND === undefined ? default_args : process.env.TEST_COMMAND
    const username = process.env.GITHUB_USERNAME === undefined ? 'mona' : process.env.GITHUB_USERNAME
    const issueNumber = new Number(
      process.env.GITHUB_ISSUE_NUMBER === undefined ? new Number(1) : process.env.GITHUB_ISSUE_NUMBER
    )

    github.context.payload = {
      comment: {
        body: `/issuescomment ${args}/endissuescomment`,
        user: {login: username}
      },
      issue: {number: issueNumber.valueOf()}
    }

    function run() {
      return main()
    }

    expect(run).not.toThrow()
  })
})
