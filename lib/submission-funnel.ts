export type SubmissionFunnel = {
  started: number;
  recipeReady: number;
  attempted: number;
  completed: number;
  abandonedBeforeAttempt: number;
  unsuccessfulAttempts: number;
  startToCompletionRate: number | null;
};

export function buildSubmissionFunnel(
  events: Array<{ event_key: string; page_path?: string | null }>,
): SubmissionFunnel {
  const count = (key: string) => events.filter((event) => event.event_key === key).length;
  const started = count("recipe_submission_started");
  const recipeReady = count("recipe_submission_progress");
  const attempted = count("recipe_submission_attempt");
  const completed = events.filter(
    (event) => event.event_key === "recipe_submission_success" && event.page_path === "/share",
  ).length;

  return {
    started,
    recipeReady,
    attempted,
    completed,
    abandonedBeforeAttempt: Math.max(0, started - attempted),
    unsuccessfulAttempts: Math.max(0, attempted - completed),
    startToCompletionRate: started > 0 ? completed / started : null,
  };
}
