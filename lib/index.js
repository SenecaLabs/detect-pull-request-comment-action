"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { GITHUB_TOKEN } = process.env;
            if (!GITHUB_TOKEN) {
                core.setFailed("GITHUB_TOKEN is required");
                return;
            }
            const trigger_string = core.getInput("trigger_string");
            const reaction = core.getInput("reaction");
            if (!allowedCommentReactions.includes(reaction)) {
                core.setFailed(`Received invalid reaction, must be one of: ${allowedCommentReactions.join(", ")}`);
                return;
            }
            // @ts-ignore
            const { pull_request } = github_1.context.payload.issue || {};
            if (github_1.context.eventName === "issue_comment" && !pull_request) {
                // not a pull-request comment, aborting
                core.setOutput("triggered", "false");
                return;
            }
            const body = github_1.context.payload.comment.body;
            if (!body.includes(trigger_string)) {
                core.setOutput("triggered", "false");
                return;
            }
            const client = new github_1.GitHub(GITHUB_TOKEN);
            const { owner, repo } = github_1.context.repo;
            const { data: commitsOnPr } = yield client.pulls.listCommits({
                owner,
                repo,
                per_page: 100,
                pull_number: github_1.context.payload.issue.number
            });
            if (commitsOnPr.length >= 100) {
                throw new Error(`PR ${github_1.context.payload.issue.number} has more than 100 commits, this action does not support that yet.`);
            }
            core.setOutput("triggered", "true");
            core.setOutput("comment_body", body);
            core.setOutput("commit_sha", commitsOnPr[commitsOnPr.length - 1].sha);
            // Add a reaction to the comment so we know it's been processed
            yield client.reactions.createForIssueComment({
                owner,
                repo,
                comment_id: github_1.context.payload.comment.id,
                content: reaction
            });
        }
        catch (err) {
            core.setFailed(err.message);
        }
    });
}
run();
