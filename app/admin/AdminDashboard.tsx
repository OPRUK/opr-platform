"use client";

import type { Session } from "@supabase/supabase-js";
import { FormEvent, useEffect, useState } from "react";
import { featuredRecipes } from "../../lib/recipes";
import { supabase } from "../../lib/supabase/client";

type SubmissionStatus = "new" | "reviewed" | "selected";

type Submission = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  location: string | null;
  title: string;
  category: string;
  servings: string | null;
  story: string;
  ingredients: string;
  method: string;
  cook_notes: string | null;
  permission_to_feature: boolean;
  status: SubmissionStatus;
  photo_path: string | null;
  contributor_photo_path: string | null;
  original_recipe_path: string | null;
  audio_story_path: string | null;
  recipe_video_path: string | null;
  is_published: boolean;
  published_at: string | null;
  is_recipe_of_week: boolean;
  recipe_of_week_note: string | null;
};

type CommunityCook = {
  id: number;
  recipe_submission_id: number;
  name: string;
  note: string | null;
  photo_path: string | null;
  is_approved: boolean;
  created_at: string;
  recipe_submissions: { title: string } | null;
};

type RecipeOfMonthResults = {
  monthKey: string;
  totals: Record<string, number>;
  totalVotes: number;
};

const allowedEmail = "chaten@otherpeoplesrecipes.co.uk";

const statusStyle: Record<SubmissionStatus, string> = {
  new: "bg-[#F4DDAE] text-[#6B431E]",
  reviewed: "bg-[#E8E2CF] text-[#123C39]",
  selected: "bg-[#CDE4CD] text-[#2E5A35]",
};

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState(allowedEmail);
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [communityCooks, setCommunityCooks] = useState<CommunityCook[]>([]);
  const [recipeOfMonthResults, setRecipeOfMonthResults] = useState<RecipeOfMonthResults | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || session.user.email !== allowedEmail) {
      return;
    }

    async function loadSubmissions() {
      setLoading(true);
      const [recipeResponse, communityResponse, votingResponse] = await Promise.all([
        adminRequest("/api/admin/recipe-submission"),
        adminRequest("/api/admin/community-cook"),
        adminRequest("/api/admin/recipe-of-month"),
      ]);
      if (!recipeResponse.ok) {
        const payload = await recipeResponse.json().catch(() => null);
        setMessage(
          payload?.error
            ? `Recipe inbox error: ${payload.error}`
            : `Recipe inbox error: ${recipeResponse.status}`,
        );
      } else {
        const { submissions: data } = await recipeResponse.json();
        setSubmissions((data ?? []) as Submission[]);
      }
      if (communityResponse.ok) {
        const { communityCooks: data } = await communityResponse.json();
        setCommunityCooks((data ?? []) as CommunityCook[]);
      } else if (recipeResponse.ok) {
        setMessage("The recipe inbox loaded, but community posts could not be loaded just now.");
      }
      if (votingResponse.ok) {
        setRecipeOfMonthResults((await votingResponse.json()) as RecipeOfMonthResults);
      }
      setLoading(false);
    }

    void loadSubmissions();
  }, [session]);

  async function adminRequest(path: string, options: RequestInit = {}) {
    const { data } = await supabase.auth.getSession();
    let accessToken = data.session?.access_token ?? "";
    const expiresSoon = data.session?.expires_at
      ? data.session.expires_at * 1000 - Date.now() < 60_000
      : false;

    if (expiresSoon) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      accessToken = refreshed.session?.access_token ?? accessToken;
    }

    return fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (email.trim().toLowerCase() !== allowedEmail) {
      setMessage("This dashboard is only available to the OPR team account.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: allowedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setMessage(
      error
        ? "We could not send the sign-in email. Please try again."
        : "Check your inbox for your secure OPR sign-in link.",
    );
  }

  async function updateStatus(id: number, status: SubmissionStatus) {
    const response = await adminRequest("/api/admin/recipe-submission", {
      method: "PATCH",
      body: JSON.stringify({ id, changes: { status } }),
    });
    if (!response.ok) {
      setMessage("We could not update that recipe. Please try again.");
      return;
    }

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id ? { ...submission, status } : submission,
      ),
    );
    setSelectedSubmission((current) =>
      current?.id === id ? { ...current, status } : current,
    );
  }

  async function togglePublished(submission: Submission) {
    const willPublish = !submission.is_published;
    setMessage("");
    const publishedAt = willPublish ? new Date().toISOString() : null;
    const response = await adminRequest("/api/admin/recipe-submission", {
      method: "PATCH",
      body: JSON.stringify({
        id: submission.id,
        changes: {
        is_published: willPublish,
        published_at: publishedAt,
        status: willPublish ? "selected" : submission.status,
        is_recipe_of_week: willPublish ? submission.is_recipe_of_week : false,
        },
      }),
    });
    if (!response.ok) {
      setMessage("We could not change this recipe's publishing status. Please try again.");
      return;
    }

    const changes = {
      is_published: willPublish,
      published_at: publishedAt,
      status: willPublish ? "selected" as SubmissionStatus : submission.status,
      is_recipe_of_week: willPublish ? submission.is_recipe_of_week : false,
    };
    setSubmissions((current) =>
      current.map((item) => (item.id === submission.id ? { ...item, ...changes } : item)),
    );
    setSelectedSubmission((current) =>
      current?.id === submission.id ? { ...current, ...changes } : current,
    );

    if (willPublish) {
      setMessage(`Published: ${submission.title} is now live in the Family Cookbook.`);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        await fetch("/api/recipe-published", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
          },
          body: JSON.stringify({
            id: submission.id,
            name: submission.name,
            email: submission.email,
            title: submission.title,
          }),
        });
      } catch {
        // Publishing remains successful even if the email service is temporarily unavailable.
      }
    } else {
      setMessage(`${submission.title} has been removed from the public Family Cookbook.`);
    }
  }

  async function deleteSubmission(submission: Submission) {
    const confirmed = window.confirm(
      `Permanently delete “${submission.title}”? This also removes any recipe photos, the original recipe image, voice story and recipe video. This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(submission.id);
    setMessage("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch("/api/admin/recipe-submission", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ id: submission.id }),
      });

      if (!response.ok) throw new Error("Recipe could not be deleted");

      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setSelectedSubmission(null);
      setMessage(`Deleted: ${submission.title} has been permanently removed.`);
    } catch {
      setMessage("We could not permanently delete that recipe. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function updateCommunityCook(cook: CommunityCook, isApproved: boolean) {
    const response = await adminRequest("/api/admin/community-cook", {
      method: "PATCH",
      body: JSON.stringify({ id: cook.id, isApproved }),
    });
    if (!response.ok) {
      setMessage("We could not update that community post. Please try again.");
      return;
    }
    setCommunityCooks((current) => current.map((item) => item.id === cook.id ? { ...item, is_approved: isApproved } : item));
    setMessage(isApproved ? `Approved ${cook.name}'s community post.` : `Hid ${cook.name}'s community post.`);
  }

  async function deleteCommunityCook(cook: CommunityCook) {
    if (!window.confirm(`Permanently delete ${cook.name}'s community post?`)) return;
    const response = await adminRequest("/api/admin/community-cook", {
      method: "DELETE",
      body: JSON.stringify({ id: cook.id }),
    });
    if (!response.ok) {
      setMessage("We could not delete that community post. Please try again.");
      return;
    }
    setCommunityCooks((current) => current.filter((item) => item.id !== cook.id));
    setMessage(`Deleted ${cook.name}'s community post.`);
  }

  function updateRecipeOfWeekNote(value: string) {
    if (!selectedSubmission) return;

    setSelectedSubmission((current) =>
      current ? { ...current, recipe_of_week_note: value } : current,
    );
    setSubmissions((current) =>
      current.map((item) =>
        item.id === selectedSubmission.id ? { ...item, recipe_of_week_note: value } : item,
      ),
    );
  }

  async function toggleRecipeOfWeek(submission: Submission) {
    setMessage("");

    if (!submission.is_published) {
      setMessage("Publish this recipe to the cookbook before making it Recipe of the Week.");
      return;
    }

    const willFeature = !submission.is_recipe_of_week;

    const response = await adminRequest("/api/admin/recipe-submission", {
      method: "PATCH",
      body: JSON.stringify({
        action: "feature",
        id: submission.id,
        featured: willFeature,
        note: submission.recipe_of_week_note,
      }),
    });
    if (!response.ok) {
      setMessage("We could not update Recipe of the Week just now. Please try again.");
      return;
    }

    setSubmissions((current) =>
      current.map((item) => ({
        ...item,
        is_recipe_of_week: willFeature ? item.id === submission.id : item.id === submission.id ? false : item.is_recipe_of_week,
        recipe_of_week_note: item.id === submission.id
          ? willFeature
            ? submission.recipe_of_week_note?.trim() || null
            : null
          : item.recipe_of_week_note,
      })),
    );
    setSelectedSubmission((current) =>
      current
        ? {
            ...current,
            is_recipe_of_week: willFeature,
            recipe_of_week_note: willFeature ? current.recipe_of_week_note?.trim() || null : null,
          }
        : current,
    );
  }

  const selectedPhotoUrl = selectedSubmission?.photo_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(selectedSubmission.photo_path).data.publicUrl
    : null;
  const selectedOriginalRecipeUrl = selectedSubmission?.original_recipe_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(selectedSubmission.original_recipe_path).data.publicUrl
    : null;
  const selectedContributorPhotoUrl = selectedSubmission?.contributor_photo_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(selectedSubmission.contributor_photo_path).data.publicUrl
    : null;
  const selectedAudioStoryUrl = selectedSubmission?.audio_story_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(selectedSubmission.audio_story_path).data.publicUrl
    : null;
  const selectedRecipeVideoUrl = selectedSubmission?.recipe_video_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(selectedSubmission.recipe_video_path).data.publicUrl
    : null;

  function communityCookPhotoUrl(cook: CommunityCook) {
    return cook.photo_path
      ? supabase.storage.from("recipe-photos").getPublicUrl(cook.photo_path).data.publicUrl
      : null;
  }

  const recipeVoteLabels = new Map<string, string>(
    featuredRecipes.map((recipe) => [`featured-${recipe.slug}`, recipe.title]),
  );
  for (const submission of submissions) {
    recipeVoteLabels.set(`community-${submission.id}`, submission.title);
  }
  const monthlyVoteLeaders = Object.entries(recipeOfMonthResults?.totals ?? {})
    .sort(([, firstVotes], [, secondVotes]) => secondVotes - firstVotes);

  if (loading && !session) {
    return <main className="min-h-screen bg-[#EED8B2]" />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EED8B2] px-6 text-[#123C39]">
        <form
          onSubmit={sendMagicLink}
          className="w-full max-w-md rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-10"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Private OPR area
          </p>
          <h1 className="mt-4 text-4xl font-bold">Recipe inbox</h1>
          <p className="mt-5 leading-7 text-stone-700">
            We&apos;ll send a secure sign-in link to your OPR email address.
          </p>
          <label className="mt-8 block text-sm font-medium">
            OPR email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              className="mt-3 w-full rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#D1AD75]/60"
            />
          </label>
          <button
            type="submit"
            className="mt-8 rounded-full bg-[#123C39] px-7 py-3 font-medium text-white transition hover:bg-[#08231F]"
          >
            Send secure sign-in link
          </button>
          {message ? <p className="mt-5 text-sm leading-6 text-stone-700">{message}</p> : null}
        </form>
      </main>
    );
  }

  if (session.user.email !== allowedEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EED8B2] px-6 text-center text-[#123C39]">
        <div className="max-w-lg rounded-3xl bg-[#FFF3DF] p-10 shadow-xl shadow-[#1C5A50]/15">
          <h1 className="text-3xl font-bold">This inbox is private.</h1>
          <p className="mt-5 leading-7 text-stone-700">
            Please sign in using the OPR team email address.
          </p>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="mt-8 rounded-full border border-[#123C39] px-6 py-3 font-medium"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EED8B2] px-6 py-10 text-[#123C39] md:px-10">
      <header className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Private OPR area</p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">Recipe inbox</h1>
          <p className="mt-4 text-lg text-stone-700">
            {submissions.length} {submissions.length === 1 ? "recipe" : "recipes"} shared with OPR.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="self-start rounded-full border border-[#123C39] px-5 py-2.5 text-sm font-medium transition hover:bg-[#123C39] hover:text-white md:self-auto"
        >
          Sign out
        </button>
      </header>

      {message ? (
        <p className={`mx-auto mt-8 max-w-7xl text-sm ${message.startsWith("Published:") || message.startsWith("Deleted:") || message.includes("removed from") ? "text-[#2E5A35]" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}

      <section className="mx-auto mt-10 max-w-7xl overflow-hidden rounded-3xl border border-[#D1AD75]/70 bg-[#123C39] px-6 py-7 text-[#FFF3DF] shadow-xl shadow-[#1C5A50]/15 md:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[#F0C45A]">Recipe of the Month</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">This month&apos;s voting</h2>
            <p className="mt-2 text-sm leading-6 text-[#F6E3BE]">
              {recipeOfMonthResults
                ? `${recipeOfMonthResults.totalVotes} ${recipeOfMonthResults.totalVotes === 1 ? "vote has" : "votes have"} been cast in ${new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" }).format(new Date(`${recipeOfMonthResults.monthKey}-01T12:00:00Z`))}.`
                : "Voting results will appear here once the new voting table is live."}
            </p>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#F6E3BE]">At month-end, use the leading recipe as your clear winner, then announce it through the homepage and social channels.</p>
        </div>
        {recipeOfMonthResults ? (
          monthlyVoteLeaders.length ? (
            <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {monthlyVoteLeaders.map(([recipeKey, votes], index) => (
                <li key={recipeKey} className="rounded-2xl border border-[#D1AD75]/60 bg-white/10 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#F0C45A]">{index === 0 ? "Leading recipe" : `Place ${index + 1}`}</p>
                  <p className="mt-2 font-bold text-white">{recipeVoteLabels.get(recipeKey) ?? "A recipe shared with OPR"}</p>
                  <p className="mt-1 text-sm text-[#F6E3BE]">{votes} {votes === 1 ? "vote" : "votes"}</p>
                </li>
              ))}
            </ol>
          ) : <p className="mt-6 rounded-2xl border border-[#D1AD75]/60 bg-white/10 px-4 py-4 text-sm text-[#F6E3BE]">No votes yet. The first visitor can choose the recipe that should take this month&apos;s table.</p>
        ) : null}
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-xl shadow-[#1C5A50]/10">
          <div className="border-b border-[#D1AD75]/70 px-6 py-5">
            <h2 className="text-xl font-bold">All submissions</h2>
          </div>
          <div className="divide-y divide-[#D1AD75]/50">
            {loading ? <p className="p-6 text-stone-600">Loading recipes...</p> : null}
            {!loading && submissions.length === 0 ? (
              <p className="p-6 leading-7 text-stone-700">No recipes have arrived yet.</p>
            ) : null}
            {submissions.map((submission) => (
              <button
                type="button"
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="w-full px-6 py-5 text-left transition hover:bg-[#F4DDAE]/65"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{submission.title}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {submission.name}{submission.location ? ` · ${submission.location}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyle[submission.status]}`}>
                    {submission.is_published ? "Published" : submission.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <section className="rounded-3xl bg-[#FFF3DF] p-7 shadow-xl shadow-[#1C5A50]/10 md:p-10">
          {selectedSubmission ? (
            <>
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-700">
                    {selectedSubmission.category}
                  </p>
                  <h2 className="mt-3 text-4xl font-bold">{selectedSubmission.title}</h2>
                  <p className="mt-3 text-stone-700">
                    Shared by {selectedSubmission.name}
                    {selectedSubmission.location ? ` from ${selectedSubmission.location}` : ""}
                  </p>
                </div>
                <select
                  value={selectedSubmission.status}
                  onChange={(event) =>
                    void updateStatus(selectedSubmission.id, event.target.value as SubmissionStatus)
                  }
                  className="rounded-full border border-[#D1AD75] bg-[#F4DDAE] px-4 py-2.5 text-sm font-medium capitalize outline-none"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="selected">Selected</option>
                </select>
              </div>

              <div className="mt-7 rounded-2xl border border-[#D1AD75]/70 bg-[#F4DDAE]/45 p-5 md:flex md:items-center md:justify-between md:gap-6">
                <div>
                  <h3 className="font-bold">{selectedSubmission.is_published ? "Live in the Family Cookbook" : "Approve and publish"}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-700">
                    {selectedSubmission.is_published
                      ? "This recipe is visible to everyone in the public cookbook."
                      : "When you approve it, this recipe, its story and its photo become visible in the public Family Cookbook."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void togglePublished(selectedSubmission)}
                  className="mt-4 rounded-full bg-[#123C39] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#08231F] md:mt-0"
                >
                  {selectedSubmission.is_published ? "Hide from cookbook" : "Approve & publish"}
                </button>
              </div>
              {selectedSubmission.is_published ? (
                <a
                  href={`/family-cookbook/community/${selectedSubmission.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full border border-[#123C39] px-5 py-2.5 text-sm font-medium text-[#123C39] transition hover:bg-[#123C39] hover:text-white"
                >
                  View public recipe →
                </a>
              ) : null}

              <div className="mt-5 rounded-2xl border border-[#D1AD75]/70 bg-[#FFF3DF] p-5">
                <div className="md:flex md:items-start md:justify-between md:gap-6">
                  <div>
                    <h3 className="font-bold">
                      {selectedSubmission.is_recipe_of_week ? "This is Recipe of the Week" : "Feature this recipe on the homepage"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-stone-700">
                      Choose one published recipe at a time. It will become the homepage&apos;s weekly story.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void toggleRecipeOfWeek(selectedSubmission)}
                    className="mt-4 rounded-full bg-[#9A622A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B431E] md:mt-0"
                  >
                    {selectedSubmission.is_recipe_of_week ? "Remove as Recipe of the Week" : "Make Recipe of the Week"}
                  </button>
                </div>
                <label className="mt-5 block text-sm font-medium">
                  Why this recipe this week? <span className="font-normal text-stone-500">(optional)</span>
                  <textarea
                    value={selectedSubmission.recipe_of_week_note ?? ""}
                    onChange={(event) => updateRecipeOfWeekNote(event.target.value)}
                    rows={3}
                    placeholder="For example: A family favourite that deserves a place at the centre of the table."
                    className="mt-3 w-full resize-y rounded-xl border border-[#D1AD75] bg-white px-4 py-3 leading-6 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#D1AD75]/60"
                  />
                </label>
              </div>

              <div className="mt-10 space-y-8 text-stone-700">
                {selectedPhotoUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Recipe photo</h3>
                    <img
                      src={selectedPhotoUrl}
                      alt={selectedSubmission.title}
                      className="mt-4 max-h-[28rem] w-full rounded-2xl object-cover shadow-lg"
                    />
                  </article>
                ) : null}
                {selectedContributorPhotoUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Meet the cook</h3>
                    <div className="mt-4 flex items-center gap-4">
                      <img
                        src={selectedContributorPhotoUrl}
                        alt={`${selectedSubmission.name}, who shared ${selectedSubmission.title}`}
                        className="h-24 w-24 rounded-full object-cover shadow-lg"
                      />
                      <p className="font-medium text-[#123C39]">{selectedSubmission.name}</p>
                    </div>
                  </article>
                ) : null}
                {selectedOriginalRecipeUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">The original recipe</h3>
                    <img
                      src={selectedOriginalRecipeUrl}
                      alt={`The original recipe for ${selectedSubmission.title}`}
                      className="mt-4 max-h-[36rem] w-full rounded-2xl object-contain shadow-lg"
                    />
                  </article>
                ) : null}
                {selectedAudioStoryUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Voice story</h3>
                    <audio controls preload="metadata" src={selectedAudioStoryUrl} className="mt-4 w-full" />
                  </article>
                ) : null}
                {selectedRecipeVideoUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Recipe video</h3>
                    <video controls playsInline preload="metadata" src={selectedRecipeVideoUrl} className="mt-4 aspect-video w-full rounded-2xl bg-black" />
                  </article>
                ) : null}
                <article>
                  <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">The story</h3>
                  <p className="mt-3 whitespace-pre-wrap leading-8">{selectedSubmission.story}</p>
                </article>
                <article>
                  <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Ingredients</h3>
                  <p className="mt-3 whitespace-pre-wrap leading-8">{selectedSubmission.ingredients}</p>
                </article>
                <article>
                  <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Method</h3>
                  <p className="mt-3 whitespace-pre-wrap leading-8">{selectedSubmission.method}</p>
                </article>
                {selectedSubmission.cook_notes ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Cook&apos;s notes &amp; swaps</h3>
                    <p className="mt-3 whitespace-pre-wrap leading-8">{selectedSubmission.cook_notes}</p>
                  </article>
                ) : null}
                <p className="border-t border-[#D1AD75]/70 pt-6 text-sm">
                  Contact: <a className="underline" href={`mailto:${selectedSubmission.email}`}>{selectedSubmission.email}</a>
                  {selectedSubmission.servings ? ` · Serves ${selectedSubmission.servings}` : ""}
                  {selectedSubmission.permission_to_feature ? " · Happy to be contacted about featuring" : " · No feature contact permission"}
                </p>
                <div className="rounded-2xl border border-red-300 bg-red-50 p-5">
                  <h3 className="font-bold text-red-900">Permanent removal</h3>
                  <p className="mt-1 text-sm leading-6 text-red-800">
                    Use this only for spam, tests, duplicates or a submission you no longer need. It deletes the recipe and any files attached to it.
                  </p>
                  <button
                    type="button"
                    onClick={() => void deleteSubmission(selectedSubmission)}
                    disabled={deletingId === selectedSubmission.id}
                    className="mt-4 rounded-full bg-red-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === selectedSubmission.id ? "Deleting..." : "Delete permanently"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-center text-stone-600">
              <p>Select a recipe to read its story.</p>
            </div>
          )}
        </section>
      </section>

      <section className="mx-auto mt-10 max-w-7xl overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-xl shadow-[#1C5A50]/10">
        <div className="border-b border-[#D1AD75]/70 px-6 py-5 md:px-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Cooked by our community</p>
          <h2 className="mt-2 text-2xl font-bold">Community posts awaiting your review</h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">Approve a post to show it on the recipe page, hide it again at any time, or remove it permanently.</p>
        </div>
        {communityCooks.length ? (
          <div className="divide-y divide-[#D1AD75]/50">
            {communityCooks.map((cook) => {
              const photoUrl = communityCookPhotoUrl(cook);
              return (
                <article key={cook.id} className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
                  <div className="flex min-w-0 items-center gap-4">
                    {photoUrl ? <img src={photoUrl} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F4DDAE] font-bold">{cook.name.charAt(0).toUpperCase()}</div>}
                    <div>
                      <p className="font-bold">{cook.name} <span className="font-normal text-stone-500">cooked {cook.recipe_submissions?.title ?? "an OPR recipe"}</span></p>
                      {cook.note ? <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-700">“{cook.note}”</p> : <p className="mt-1 text-sm text-stone-500">No note supplied.</p>}
                      <p className={`mt-2 text-xs font-bold uppercase tracking-[0.18em] ${cook.is_approved ? "text-[#2E5A35]" : "text-[#9A622A]"}`}>{cook.is_approved ? "Live on recipe page" : "Awaiting approval"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button type="button" onClick={() => void updateCommunityCook(cook, !cook.is_approved)} className="rounded-full bg-[#123C39] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#08231F]">
                      {cook.is_approved ? "Hide post" : "Approve post"}
                    </button>
                    <button type="button" onClick={() => void deleteCommunityCook(cook)} className="rounded-full border border-red-700 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-50">Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <p className="px-6 py-8 text-stone-700 md:px-8">No community posts have arrived yet.</p>}
      </section>
    </main>
  );
}
