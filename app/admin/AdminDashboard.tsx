"use client";

import type { Session } from "@supabase/supabase-js";
import { FormEvent, useEffect, useState } from "react";
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
  permission_to_feature: boolean;
  status: SubmissionStatus;
  photo_path: string | null;
  is_published: boolean;
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
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

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
      const { data, error } = await supabase
        .from("recipe_submissions")
        .select(
          "id, created_at, name, email, location, title, category, servings, story, ingredients, method, permission_to_feature, status, photo_path, is_published",
        )
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("We could not load the recipe inbox just now.");
      } else {
        setSubmissions((data ?? []) as Submission[]);
      }
      setLoading(false);
    }

    void loadSubmissions();
  }, [session]);

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
    const { error } = await supabase
      .from("recipe_submissions")
      .update({ status })
      .eq("id", id);

    if (error) {
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
    const { error } = await supabase
      .from("recipe_submissions")
      .update({
        is_published: willPublish,
        published_at: willPublish ? new Date().toISOString() : null,
        status: willPublish ? "selected" : submission.status,
      })
      .eq("id", submission.id);

    if (error) {
      setMessage("We could not change this recipe's publishing status. Please try again.");
      return;
    }

    const changes = {
      is_published: willPublish,
      status: willPublish ? "selected" as SubmissionStatus : submission.status,
    };
    setSubmissions((current) =>
      current.map((item) => (item.id === submission.id ? { ...item, ...changes } : item)),
    );
    setSelectedSubmission((current) =>
      current?.id === submission.id ? { ...current, ...changes } : current,
    );

    if (willPublish) {
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
    }
  }

  const selectedPhotoUrl = selectedSubmission?.photo_path
    ? supabase.storage.from("recipe-photos").getPublicUrl(selectedSubmission.photo_path).data.publicUrl
    : null;

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

      {message ? <p className="mx-auto mt-8 max-w-7xl text-sm text-red-800">{message}</p> : null}

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
                  <h3 className="font-bold">{selectedSubmission.is_published ? "Live in the Family Cookbook" : "Ready to share?"}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-700">
                    {selectedSubmission.is_published
                      ? "This recipe is visible to everyone in the public cookbook."
                      : "Publishing makes this recipe, its story and its photo visible in the public Family Cookbook."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void togglePublished(selectedSubmission)}
                  className="mt-4 rounded-full bg-[#123C39] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#08231F] md:mt-0"
                >
                  {selectedSubmission.is_published ? "Remove from cookbook" : "Publish to cookbook"}
                </button>
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
                <p className="border-t border-[#D1AD75]/70 pt-6 text-sm">
                  Contact: <a className="underline" href={`mailto:${selectedSubmission.email}`}>{selectedSubmission.email}</a>
                  {selectedSubmission.servings ? ` · Serves ${selectedSubmission.servings}` : ""}
                  {selectedSubmission.permission_to_feature ? " · Happy to be contacted about featuring" : " · No feature contact permission"}
                </p>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-center text-stone-600">
              <p>Select a recipe to read its story.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
