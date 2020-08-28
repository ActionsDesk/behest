## For Development

## Node.js

Setup node using `nvm` and use version `12`.

## Common Targets
- `npm run build` - build the typescript code
- `npm run pack`  - pack the package for deployment
- `npm run lint`  - perform lint check operations
- `npm run test`  - run all test cases in `__tests__` except `**/*.debug.test.ts`
- `npm run debug <test name>` - runs `__tests__/main.debug.test.ts` without mocking and targets a <test name> so you can attach with a debuger like VS Code with `F5`

## Debugging

If your using `npm run debug` know that you'll likely need to add your command to `__tests__/main.debug.test.ts` in un-mocked mode so you can try it. This speeds up any development process because you don't have to deploy the action to try it out. Set any environment varaibles to pass arguments to your funciton and specify the `<test name>` in the target to just run through your code path for your function you want to debugging.

Example:
After setting `GITHUB_TOKEN` to run `/issuescomment` we can type the command:
```
TEST_COMMAND='test message' \
GITHUB_REPOSITORY='wenlock/test-repo-0' \
GITHUB_USERNAME=wenlock \
GITHUB_ISSUE_NUMBER=5 \
   npm run debug "runs issuescomment"
```

And then attach to the process with VS Code `F5` for deubbging.