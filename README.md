# Detect pull request comment action


When triggered by the `issue_comment` event this action will:
- check to make sure this issue is a PR (github represents both issues and PRs as issues)
- check to see if the comments body contains  

Potential gotchas:
- Because the `issue_comment` event is not associated to a PR any workflows triggered by this event will not be run until they are merged into `master`. I.e. annoyingly you cannot test these workflows on the same branch that you are adding them in. 
- The `issue_comment` event will only run on comments added to the PR after it has been opened (it will not run for the default comment added when the PR is opened)
  - The action doesn't support the default PR comment yet either


```YAML
name: "Run On PR Comment Action"
on:
  issue_comment:
    types: [created]

jobs:
  run-on-comment:
    name: "Run on PR comment"
    runs-on: ubuntu-latest
    steps:
      - uses: SenecaLabs/detect-pull-request-comment-action@v1
        id: check
        with:
          trigger_string: "run sick action" # string to search for in the comments
          reaction: rocket # the action will add this emoji reaction to signify is been seen already
        env:
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
      - run: "echo Ran it!"
        if: steps.check.outputs.triggered == 'true'
      - run: "echo Body: ${{ steps.check.outputs.comment_body }}"
        if: steps.check.outputs.triggered == 'true'
      - run: "echo Commit: ${{ steps.check.outputs.commit_sha }}"
        if: steps.check.outputs.triggered == 'true'
```


## To release a new version of this action

For github actions to work they need to have all files checked into the repo, this includes all the contents of the `node_modules` and any built `lib/*.js` files. 

To update this action: 
1) branch off `master`, make your change, get it reviewed and merged into master
2) branch off `master` to a new `release-v<version_to_release>` branch
3) run `./release.sh v<version_to_release>`
4) you will now be able to consume this action at `SenecaLabs/detect-pull-request-comment-action@v<version_to_release>`