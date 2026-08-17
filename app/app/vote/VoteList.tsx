"use client";

import { useEffect, useState } from "react";
import { getVoteCandidates, type MobileRecipeSummary } from "../../../lib/mobile-recipes";

type VoteResults = {
  monthKey: string;
  selectedRecipeKey: string | null;
  totals: Record<string, number>;
};

export default function VoteList() {
  const [candidates, setCandidates] = useState<MobileRecipeSummary[] | null>(null);
  const [results, setResults] = useState<VoteResults | null>(null);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void getVoteCandidates().then(setCandidates);
  }, []);

  useEffect(() => {
    async function loadVoting() {
      try {
        const response = await fetch("/api/recipe-of-month", { cache: "no-store" });
        if (response.ok) setResults((await response.json()) as VoteResults);
      } catch {
        // The cookbook still works if voting has not yet been switched on.
      }
    }

    void loadVoting();
  }, []);

  const hasVoted = Boolean(results?.selectedRecipeKey);

  async function vote(recipeKey: string) {
    if (hasVoted || votingFor) return;
    setVotingFor(recipeKey);
    setError("");

    try {
      const response = await fetch("/api/recipe-of-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeKey }),
      });
      const payload = (await response.json()) as VoteResults & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Your vote could not be saved just now.");
      setResults(payload);
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Your vote could not be saved just now.");
    } finally {
      setVotingFor(null);
    }
  }

  if (!candidates) return null;

  return (
    <div>
      {candidates.map((candidate) => {
        const isVoted = results?.selectedRecipeKey === candidate.id;
        const votes = results?.totals[candidate.id] ?? 0;

        return (
          <div key={candidate.id} className="flex items-center gap-3 border-b-2 border-[#123C39]/35 py-3.5">
            <div className="h-16 w-16 flex-shrink-0 bg-[#EED8B2]">
              {candidate.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- may be a Supabase Storage URL, not a configured Image domain
                <img src={candidate.image} alt={candidate.title} className="h-16 w-16 object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold">{candidate.title}</div>
              <div className="text-xs opacity-80">
                {candidate.place}
                {results ? ` · ${votes} ${votes === 1 ? "vote" : "votes"}` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => vote(candidate.id)}
              disabled={hasVoted || Boolean(votingFor)}
              className="flex-shrink-0 border border-[#123C39] px-3.5 py-2 text-base font-medium transition hover:bg-[#123C39] hover:text-[#EED8B2] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#123C39]"
            >
              {isVoted ? "Voted ✓" : votingFor === candidate.id ? "Saving…" : "Vote"}
            </button>
          </div>
        );
      })}
      {error ? <p role="alert" className="mt-4 text-base text-red-800">{error}</p> : null}
    </div>
  );
}
