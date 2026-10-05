"use client";

import { useEffect, useMemo, useState } from "react";

type Candidate = {
  id: string;
  title: string;
  place: string;
};

type VoteResults = {
  monthKey: string;
  selectedRecipeKey: string | null;
  totals: Record<string, number>;
};

function monthName(monthKey: string) {
  const value = new Date(`${monthKey}-01T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    timeZone: "Europe/London",
  }).format(value);
}

export default function HomeRecipePoll({
  candidates,
  initialMonthName,
}: {
  candidates: Candidate[];
  initialMonthName: string;
}) {
  const [results, setResults] = useState<VoteResults | null>(null);
  const [choice, setChoice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVoting() {
      try {
        const response = await fetch("/api/recipe-of-month", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as VoteResults;
        setResults(payload);
        if (payload.selectedRecipeKey) setChoice(payload.selectedRecipeKey);
      } catch {
        // The cookbook remains useful if voting is temporarily unavailable.
      }
    }

    void loadVoting();
  }, []);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === results?.selectedRecipeKey),
    [candidates, results?.selectedRecipeKey],
  );
  const hasVoted = Boolean(results?.selectedRecipeKey);

  async function submitVote() {
    if (!choice || hasVoted || saving) return;

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/recipe-of-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeKey: choice }),
      });
      const payload = (await response.json()) as VoteResults & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Your vote could not be saved just now.");
      setResults(payload);
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Your vote could not be saved just now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="recipe-poll-title" className="bg-[#FFF3DF] px-6 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#DDB765]/80 bg-[#123C39] p-7 text-[#FFF3DF] shadow-xl shadow-[#08231F]/20 md:p-11">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#DDB765]">OPR Recipe of the Month</p>
        <div className="mt-4 grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div>
            <h2 id="recipe-poll-title" className="text-4xl font-bold leading-tight md:text-5xl">
              Which recipe should take the table this {results ? monthName(results.monthKey) : initialMonthName}?
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#EED8B2]">
              Choose the family recipe you would most like to cook. The winning story becomes OPR&apos;s Recipe of the Month.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDB765]/60 bg-white/10 p-5">
            {hasVoted && selectedCandidate ? (
              <div>
                <p className="text-sm font-semibold text-[#DDB765]">Your October choice</p>
                <p className="mt-2 text-2xl font-bold">{selectedCandidate.title}</p>
                <p className="mt-1 text-sm text-[#EED8B2]">{selectedCandidate.place}</p>
                <p className="mt-4 text-sm leading-6 text-[#EED8B2]">Your vote is safely recorded. Thank you for helping choose this month&apos;s recipe.</p>
              </div>
            ) : (
              <>
                <label htmlFor="home-recipe-vote" className="text-sm font-semibold text-[#DDB765]">Choose your recipe</label>
                <select
                  id="home-recipe-vote"
                  value={choice}
                  onChange={(event) => setChoice(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-[#DDB765]/70 bg-[#FFF3DF] px-4 py-3 text-[#123C39] outline-none focus:ring-2 focus:ring-[#DDB765]"
                >
                  <option value="">Select a recipe</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.title}, {candidate.place}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={submitVote}
                  disabled={!choice || saving}
                  className="mt-4 inline-flex rounded-full bg-[#DDB765] px-6 py-3 font-bold text-[#123C39] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving your vote…" : "Cast your vote"}
                </button>
                <p className="mt-3 text-sm text-[#EED8B2]">One vote per person each month.</p>
              </>
            )}
            {error ? <p role="alert" className="mt-4 rounded-xl border border-red-300/70 bg-red-950/30 px-3 py-2 text-sm text-red-100">{error}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
