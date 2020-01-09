import * as core from '@actions/core';
import { context, GitHub } from '@actions/github';

const allowedCommentReactions = [
  "+1",
  "-1",
  "laugh",
  "confused",
  "heart",
  "hooray",
  "rocket",
  "eyes"
];

async function run() {
  try {
    const { GITHUB_TOKEN } = process.env;
    if (!GITHUB_TOKEN) {
      core.setFailed("GITHUB_TOKEN is required");
      return;
    }

    const trigger_string = core.getInput("trigger_string");
    const reaction = (core.getInput("reaction") as "+1") || "eyes";

    if (!allowedCommentReactions.includes(reaction)) {
      core.setFailed(
        `Received invalid reaction, must be one of: ${allowedCommentReactions.join(
          ", "
        )}`
      );
      return;
    }

    // @ts-ignore
    const { pull_request } = context.payload.issue || {};

    if (context.eventName === "issue_comment" && !pull_request) {
      // not a pull-request comment, aborting
      core.setOutput("triggered", "false");
      return;
    }

    const body = context.payload.comment.body;

    if (!body.includes(trigger_string)) {
      core.setOutput("triggered", "false");
      return;
    }

    const client = new GitHub(GITHUB_TOKEN);
    const { owner, repo } = context.repo;

    const { data: commitsOnPr } = await client.pulls.listCommits({
      owner,
      repo,
      pull_number: context.payload.issue!.number
    });

    core.setOutput("triggered", "true");
    core.setOutput("comment_body", body);
    core.setOutput("commit_sha", commitsOnPr[commitsOnPr.length - 1].sha);

    // Add a reaction to the comment so we know it's been processed
    await client.reactions.createForIssueComment({
      owner,
      repo,
      comment_id: context.payload.comment.id,
      content: reaction
    });
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
