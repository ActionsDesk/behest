# ActionsDesk Behest

Enable commands in GitHub Issue comments

## Usage

### Actions Workflow

```Yaml
---
name: Testing behest
on:
  issue_comment:
    types: [created]

jobs:
  behest:
    runs-on: ubuntu-latest
    
    steps:
      - uses: ActionsDesk/behest@v1
        with:
          # optional; comma-separated list of teams who can run commands
          # If this is not set, user must be admin
          teams: "team1,team2"
          # token used for interacting with Issues as actions-bot
          token: ${{ secrets.GITHUB_TOKEN }}
          # token used for elevated operations against Org
          admin_token: ${{ secrets.ADMIN_TOKEN }}
```

### Invoking Commands

See [COMMANDS.md](COMMANDS.md)