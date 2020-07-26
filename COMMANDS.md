# ActionsDesk Commands

## Greet

```
/greet <username>
```

## Invite

```
/invite <username>
```

## Issues Create

Create a bunch of issues in listed repos based on a template or message and attach them to the issue where the command was initiated.

We expect `<template name>` to be a file named in the repo where the action is installed under the directory `.github/workflows/ISSUE_TEMPLATE/`.

```
/issuescreate <message|template name>
https://github.com/org/repo1
https://github.com/org/repo2
/endissuescrate
```