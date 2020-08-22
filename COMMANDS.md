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

## Issues Comment

We support `/issuescreate` and with that we now support placing comments on all associated issues that were created or linked to an existing issue. We use the `<message>` in the command to create the comment for the sub-issues. We can also filter issues that we will comment on with a list of repos.

To create a comment on all linked issues, run the command:
```
/issuescomment <message>
```

To create a comment on only a list of the repos listed, run the command:

```
/issuescomment <message>
https://github.com/org/repo1
https://github.com/org/repo2
/endissuescomment
```
