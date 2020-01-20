# ActionsDesk Behest

Enable commands in GitHub Issue comments

```Yaml
- uses: ActionsDesk/behest@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    admin_token: ${{ secrets.ADMIN_TOKEN }}
```