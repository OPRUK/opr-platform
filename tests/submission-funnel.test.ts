import assert from "node:assert/strict";
import test from "node:test";

import { buildSubmissionFunnel } from "../lib/submission-funnel.ts";

test("builds the recipe submission funnel without counting mobile completions", () => {
  const funnel = buildSubmissionFunnel([
    { event_key: "recipe_submission_started", page_path: "/share" },
    { event_key: "recipe_submission_started", page_path: "/share" },
    { event_key: "recipe_submission_progress", page_path: "/share" },
    { event_key: "recipe_submission_attempt", page_path: "/share" },
    { event_key: "recipe_submission_success", page_path: "/share" },
    { event_key: "recipe_submission_success", page_path: "/app/share" },
  ]);

  assert.deepEqual(funnel, {
    started: 2,
    recipeReady: 1,
    attempted: 1,
    completed: 1,
    abandonedBeforeAttempt: 1,
    unsuccessfulAttempts: 0,
    startToCompletionRate: 0.5,
  });
});

test("clamps aggregate drop-off estimates when historical completions exceed new events", () => {
  const funnel = buildSubmissionFunnel([
    { event_key: "recipe_submission_success", page_path: "/share" },
  ]);

  assert.equal(funnel.abandonedBeforeAttempt, 0);
  assert.equal(funnel.unsuccessfulAttempts, 0);
  assert.equal(funnel.startToCompletionRate, null);
});
