# ActionsDesk Behest

Enable commands in GitHub Issue comments

## Usage

### Actions Workflow

```Yaml
- uses: ActionsDesk/behest@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    admin_token: ${{ secrets.ADMIN_TOKEN }}
```

### Invoking Commands

See [COMMANDS.md](./commands.md)