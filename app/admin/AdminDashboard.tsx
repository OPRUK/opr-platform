"use client";

import type { Session } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { AdminAnalyticsResponse } from "../../lib/admin-analytics-types";
import { isAdminEmail } from "../../lib/admin-emails";
import { applyCommunityRecipeEditorialOverride } from "../../lib/community-recipe-overrides";
import { featuredRecipes } from "../../lib/recipes";
import { supabase } from "../../lib/supabase/client";
import AdminAnalyticsPanel from "./AdminAnalyticsPanel";
import MfaChallenge from "./mfa/MfaChallenge";
import MfaSecurityPanel from "./mfa/MfaSecurityPanel";

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
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
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
  photo_url: string | null;
  contributor_photo_url: string | null;
  original_recipe_url: string | null;
  audio_story_url: string | null;
  recipe_video_url: string | null;
  is_published: boolean;
  published_at: string | null;
  is_recipe_of_week: boolean;
  recipe_of_week_note: string | null;
};

type CommunityCook = {
  id: number;
  recipe_submission_id: number | null;
  recipe_slug: string | null;
  recipe_title: string | null;
  name: string;
  note: string | null;
  photo_path: string | null;
  photo_url: string | null;
  is_approved: boolean;
  created_at: string;
  recipe_submissions: { title: string } | null;
};

type RecipeOfMonthResults = {
  monthKey: string;
  totals: Record<string, number>;
  totalVotes: number;
};

const statusStyle: Record<SubmissionStatus, string> = {
  new: "bg-[#EED8B2] text-[#6B431E]",
  reviewed: "bg-[#E8E2CF] text-[#123C39]",
  selected: "bg-[#EED8B2] text-[#1C5A50]",
};

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
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
}

export default function AdminDashboard({
  initialView = "inbox",
}: {
  initialView?: "inbox" | "analytics";
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [communityCooks, setCommunityCooks] = useState<CommunityCook[]>([]);
  const [recipeOfMonthResults, setRecipeOfMonthResults] = useState<RecipeOfMonthResults | null>(null);
  const [attributionSummary, setAttributionSummary] = useState<AdminAnalyticsResponse | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [aal, setAal] = useState<{ current: string | null; next: string | null } | null>(null);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [checkingAal, setCheckingAal] = useState(true);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [exportingFoundingTable, setExportingFoundingTable] = useState(false);
  const [exportingAnalytics, setExportingAnalytics] = useState(false);
  const [refreshingAnalytics, setRefreshingAnalytics] = useState(false);
  const [showNewsletterPanel, setShowNewsletterPanel] = useState(false);
  const [newsletterRecipients, setNewsletterRecipients] = useState<number | null>(null);
  const [loadingNewsletterRecipients, setLoadingNewsletterRecipients] = useState(false);
  const [newsletterConfirmation, setNewsletterConfirmation] = useState("");
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [newsletterResult, setNewsletterResult] = useState<string | null>(null);
  const analyticsRefreshInFlight = useRef(false);

  const refreshAnalytics = useCallback(async ({
    forceRefresh = true,
    silent = false,
  }: {
    forceRefresh?: boolean;
    silent?: boolean;
  } = {}) => {
    if (analyticsRefreshInFlight.current) return;
    analyticsRefreshInFlight.current = true;

    if (!silent) {
      setRefreshingAnalytics(true);
      setMessage("");
    }

    try {
      const path = forceRefresh ? "/api/admin/analytics?refresh=1" : "/api/admin/analytics";
      const response = await adminRequest(path);
      if (response.ok) {
        setAttributionSummary((await response.json()) as AdminAnalyticsResponse);
      } else if (!silent) {
        const payload = await response.json().catch(() => null);
        setMessage(payload?.error ?? "The analytics dashboard could not be refreshed just now.");
      }
    } catch {
      if (!silent) {
        setMessage("The analytics dashboard could not be refreshed just now.");
      }
    } finally {
      analyticsRefreshInFlight.current = false;
      if (!silent) setRefreshingAnalytics(false);
    }
  }, []);

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
      setCheckingAal(true);
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function refreshAal() {
    setCheckingAal(true);
    const [{ data: aalData }, { data: factorData }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);
    setAal(aalData ? { current: aalData.currentLevel, next: aalData.nextLevel } : null);
    setTotpFactorId(
      factorData?.totp.find((factor) => factor.status === "verified")?.id ?? null,
    );
    setCheckingAal(false);
  }

  useEffect(() => {
    if (!session || !isAdminEmail(session.user.email)) {
      return;
    }

    let cancelled = false;
    void Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]).then(([{ data: aalData }, { data: factorData }]) => {
      if (cancelled) return;
      setAal(aalData ? { current: aalData.currentLevel, next: aalData.nextLevel } : null);
      setTotpFactorId(
        factorData?.totp.find((factor) => factor.status === "verified")?.id ?? null,
      );
      setCheckingAal(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const mfaPending = Boolean(aal && aal.next === "aal2" && aal.current !== "aal2");

  useEffect(() => {
    if (!session || !isAdminEmail(session.user.email)) {
      return;
    }
    if (checkingAal || mfaPending || !totpFactorId) {
      // Wait until a factor is enrolled and this session has cleared the MFA
      // challenge — the admin API routes require aal2 and would otherwise
      // 401 on every request.
      return;
    }

    async function loadAdminData() {
      setLoading(true);

      if (initialView === "analytics") {
        const analyticsResponse = await adminRequest("/api/admin/analytics");
        if (analyticsResponse.ok) {
          setAttributionSummary((await analyticsResponse.json()) as AdminAnalyticsResponse);
          setMessage("");
        } else {
          const payload = await analyticsResponse.json().catch(() => null);
          setMessage(payload?.error ?? "The analytics dashboard could not be loaded just now.");
        }
        setLoading(false);
        return;
      }

      const [recipeResponse, communityResponse, votingResponse, analyticsResponse] = await Promise.all([
        adminRequest("/api/admin/recipe-submission"),
        adminRequest("/api/admin/community-cook"),
        adminRequest("/api/admin/recipe-of-month"),
        adminRequest("/api/admin/analytics"),
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
        setSubmissions(
          ((data ?? []) as Submission[]).map(applyCommunityRecipeEditorialOverride),
        );
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
      if (analyticsResponse.ok) {
        setAttributionSummary((await analyticsResponse.json()) as AdminAnalyticsResponse);
      } else if (recipeResponse.ok && communityResponse.ok && votingResponse.ok) {
        setMessage("The recipe inbox loaded, but traffic-source reporting could not be loaded just now.");
      }
      setLoading(false);
    }

    void loadAdminData();
  }, [session, checkingAal, mfaPending, totpFactorId, initialView]);

  useEffect(() => {
    if (
      initialView !== "analytics" ||
      !session ||
      !isAdminEmail(session.user.email) ||
      checkingAal ||
      mfaPending ||
      !totpFactorId
    ) {
      return;
    }

    const refreshVisibleDashboard = () => {
      if (document.visibilityState === "visible") {
        void refreshAnalytics({ forceRefresh: false, silent: true });
      }
    };
    const handleVisibilityChange = () => refreshVisibleDashboard();
    const intervalId = window.setInterval(refreshVisibleDashboard, 60_000);

    window.addEventListener("focus", refreshVisibleDashboard);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshVisibleDashboard);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    initialView,
    session,
    checkingAal,
    mfaPending,
    totpFactorId,
    refreshAnalytics,
  ]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const normalisedEmail = email.trim().toLowerCase();
    if (!isAdminEmail(normalisedEmail)) {
      setMessage("This dashboard is only available to the OPR team account.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalisedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}${initialView === "analytics" ? "/admin/analytics" : "/admin"}`,
      },
    });

    setMessage(
      error
        ? "We could not send the sign-in email. Please try again."
        : "Check your inbox for your secure OPR sign-in link.",
    );
  }

  async function mapSocialPost(platform: string, postId: string, filmVideo: string | null) {
    setMessage("");
    const response = await adminRequest("/api/admin/social-film-match", {
      method: "PATCH",
      body: JSON.stringify({ platform, postId, filmVideo, ignored: filmVideo === null }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? "The social post match could not be saved.");
      return false;
    }
    await refreshAnalytics({ forceRefresh: false, silent: true });
    return true;
  }

  async function reconnectSocial(platform: "youtube" | "pinterest") {
    setMessage("");
    const response = await adminRequest("/api/admin/social-connect", {
      method: "POST",
      body: JSON.stringify({ platform }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || typeof payload?.url !== "string") {
      setMessage(payload?.error ?? `The ${platform} reconnect could not be started.`);
      return;
    }
    window.location.assign(payload.url);
  }

  async function openNewsletterPanel() {
    setNewsletterResult(null);
    setNewsletterConfirmation("");
    setShowNewsletterPanel(true);
    setLoadingNewsletterRecipients(true);
    try {
      const response = await adminRequest("/api/admin/newsletter");
      const payload = await response.json().catch(() => null);
      setNewsletterRecipients(response.ok ? (payload?.recipients ?? 0) : null);
      if (!response.ok) {
        setNewsletterResult(payload?.error ?? "The newsletter audience could not be loaded.");
      }
    } finally {
      setLoadingNewsletterRecipients(false);
    }
  }

  async function sendNewsletter() {
    setSendingNewsletter(true);
    setNewsletterResult(null);
    try {
      const response = await adminRequest("/api/admin/newsletter", {
        method: "POST",
        body: JSON.stringify({ confirmation: newsletterConfirmation }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setNewsletterResult(payload?.error ?? "The newsletter was not sent.");
        return;
      }
      setNewsletterResult(`Sent to ${payload.sent} of ${payload.recipients} recipients.${payload.failed ? ` ${payload.failed} failed.` : ""}`);
      setNewsletterConfirmation("");
    } finally {
      setSendingNewsletter(false);
    }
  }

  async function downloadFoundingTable() {
    setMessage("");
    setExportingFoundingTable(true);

    try {
      const response = await adminRequest("/api/admin/founding-table");
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setMessage(payload?.error ?? "The table-signup spreadsheet could not be downloaded.");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? "opr-table-signups.xlsx";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch {
      setMessage("The table-signup spreadsheet could not be downloaded.");
    } finally {
      setExportingFoundingTable(false);
    }
  }

  async function downloadAnalytics() {
    setMessage("");
    setExportingAnalytics(true);

    try {
      const response = await adminRequest("/api/admin/analytics/report");
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setMessage(payload?.error ?? "The analytics spreadsheet could not be downloaded.");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? "opr-analytics.xlsx";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch {
      setMessage("The analytics spreadsheet could not be downloaded.");
    } finally {
      setExportingAnalytics(false);
    }
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
      setMessage(`Published: ${submission.title} is now live in the Living Cookbook.`);
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
      setMessage(`${submission.title} has been removed from the public Living Cookbook.`);
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
      setMessage("Publish this recipe to the cookbook before making it Recipe of the Month.");
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
      setMessage("We could not update Recipe of the Month just now. Please try again.");
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

  // Server-computed: signed URLs for unpublished (private) assets, plain
  // public URLs for published ones — see /api/admin/recipe-submission's GET
  // handler. The browser's anon client can't sign against a private bucket.
  const selectedPhotoUrl = selectedSubmission?.photo_url ?? null;
  const selectedOriginalRecipeUrl = selectedSubmission?.original_recipe_url ?? null;
  const selectedContributorPhotoUrl = selectedSubmission?.contributor_photo_url ?? null;
  const selectedAudioStoryUrl = selectedSubmission?.audio_story_url ?? null;
  const selectedRecipeVideoUrl = selectedSubmission?.recipe_video_url ?? null;

  function communityCookPhotoUrl(cook: CommunityCook) {
    return cook.photo_url ?? null;
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
    return <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2]" />;
  }

  if (!session) {
    return (
      <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-[#EED8B2] px-6 text-[#123C39]">
        <form
          onSubmit={sendMagicLink}
          className="w-full max-w-md rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-10"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Private OPR area
          </p>
          <h1 className="mt-4 text-4xl font-bold">
            {initialView === "analytics" ? "Analytics dashboard" : "Recipe inbox"}
          </h1>
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
              className="mt-3 w-full rounded-xl border border-[#DDB765] bg-[#EED8B2] px-4 py-3 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#DDB765]/60"
            />
          </label>
          <button
            type="submit"
            className="mt-8 rounded-full bg-[#123C39] px-7 py-3 font-medium text-white transition hover:bg-[#08231F]"
          >
            Send secure sign-in link
          </button>
          {message ? <p role="status" aria-live="polite" className="mt-5 text-sm leading-6 text-stone-700">{message}</p> : null}
        </form>
      </main>
    );
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-[#EED8B2] px-6 text-center text-[#123C39]">
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

  if (checkingAal) {
    return <main className="min-h-screen bg-[#EED8B2]" />;
  }

  if (mfaPending && totpFactorId) {
    return (
      <MfaChallenge
        factorId={totpFactorId}
        onVerified={() => void refreshAal()}
        onSignOut={() => void supabase.auth.signOut()}
      />
    );
  }

  if (showSecurityPanel) {
    return (
      <main className="min-h-screen bg-[#EED8B2] px-6 py-10 text-[#123C39] md:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-10">
          <MfaSecurityPanel onFactorsChanged={() => void refreshAal()} />
          <button
            type="button"
            onClick={() => setShowSecurityPanel(false)}
            className="mt-8 text-sm font-medium underline"
          >
            Back to {initialView === "analytics" ? "analytics dashboard" : "recipe inbox"}
          </button>
        </div>
      </main>
    );
  }

  if (showNewsletterPanel) {
    const confirmationMatches = newsletterConfirmation === "SEND OPR NEWSLETTER 1";
    return (
      <main className="min-h-screen bg-[#EED8B2] px-6 py-10 text-[#123C39] md:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-[#9A622A]">Newsletter</p>
          <h1 className="mt-3 text-3xl font-bold">Send the welcome newsletter</h1>
          <p className="mt-4 text-stone-700">
            {loadingNewsletterRecipients
              ? "Counting recipients…"
              : newsletterRecipients === null
                ? "The recipient count could not be loaded."
                : `This will send to ${newsletterRecipients} ${newsletterRecipients === 1 ? "person" : "people"} — everyone who opted into marketing across the Founding Table, recipe submissions, and cook-along signups.`}
          </p>

          <label className="mt-6 block text-sm font-medium">
            Type <span className="font-mono">SEND OPR NEWSLETTER 1</span> to confirm
            <input
              type="text"
              value={newsletterConfirmation}
              onChange={(event) => setNewsletterConfirmation(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#DDB765] bg-white px-4 py-3 font-mono outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#DDB765]/60"
              placeholder="SEND OPR NEWSLETTER 1"
              disabled={sendingNewsletter}
            />
          </label>

          {newsletterResult ? (
            <p role="status" aria-live="polite" className="mt-4 text-sm text-[#1C5A50]">{newsletterResult}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => void sendNewsletter()}
              disabled={!confirmationMatches || sendingNewsletter || !newsletterRecipients}
              className="rounded-full bg-[#123C39] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#08231F] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sendingNewsletter ? "Sending…" : "Send newsletter"}
            </button>
            <button
              type="button"
              onClick={() => setShowNewsletterPanel(false)}
              className="text-sm font-medium underline"
            >
              Back to {initialView === "analytics" ? "analytics dashboard" : "recipe inbox"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (initialView === "analytics") {
    return (
      <AdminAnalyticsPanel
        analytics={attributionSummary}
        loading={loading}
        message={message}
        exporting={exportingAnalytics}
        refreshing={refreshingAnalytics}
        onDownload={() => void downloadAnalytics()}
        onRefresh={() => void refreshAnalytics({ forceRefresh: true })}
        onMapSocialPost={mapSocialPost}
        onReconnectSocial={reconnectSocial}
        onOpenSecurity={() => setShowSecurityPanel(true)}
        onSignOut={() => void supabase.auth.signOut()}
      />
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] px-6 py-10 text-[#123C39] md:px-10">
      <header className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Private OPR area</p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">Recipe inbox</h1>
          {totpFactorId ? (
            <p className="mt-4 text-lg text-stone-700">
              {submissions.length} {submissions.length === 1 ? "recipe" : "recipes"} shared with OPR.
            </p>
          ) : (
            <p className="mt-4 text-lg font-medium text-[#9A622A]">
              Set up two-factor authentication to view the recipe inbox.{" "}
              <button type="button" onClick={() => setShowSecurityPanel(true)} className="underline">
                Set it up now
              </button>
              .
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
          <Link href="/admin/analytics" className="text-sm font-medium underline underline-offset-4">
            Analytics
          </Link>
          <button
            type="button"
            onClick={() => setShowSecurityPanel(true)}
            className="text-sm font-medium underline"
          >
            Security
          </button>
          <button
            type="button"
            onClick={() => void downloadFoundingTable()}
            disabled={exportingFoundingTable}
            className="rounded-full bg-[#123C39] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#08231F] disabled:cursor-wait disabled:opacity-60"
          >
            {exportingFoundingTable ? "Preparing spreadsheet…" : "Download Table Signups (.xlsx)"}
          </button>
          <button
            type="button"
            onClick={() => void openNewsletterPanel()}
            className="rounded-full border border-[#123C39] px-5 py-2.5 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
          >
            Newsletter
          </button>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="rounded-full border border-[#123C39] px-5 py-2.5 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      {message ? (
        <p role="status" aria-live="polite" className={`mx-auto mt-8 max-w-7xl text-sm ${message.startsWith("Published:") || message.startsWith("Deleted:") || message.includes("removed from") ? "text-[#1C5A50]" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}

      {attributionSummary ? (
        <section className="mx-auto mt-10 max-w-7xl rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] px-6 py-7 shadow-xl shadow-[#1C5A50]/10 md:px-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Traffic and participation sources</p>
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Last {attributionSummary.windowDays} days</h2>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Privacy-safe counts only. No names, email addresses or visitor identifiers are stored here.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["Link clicks", attributionSummary.linkClicks],
                ["Site actions", attributionSummary.ctaClicks],
                ["Conversions", attributionSummary.conversions],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#EED8B2]/70 px-4 py-3">
                  <p className="text-2xl font-bold text-[#123C39]">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6B431E]">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#DDB765] text-[#6B431E]">
                  <th className="px-3 py-3 font-semibold">Source</th>
                  <th className="px-3 py-3 font-semibold">Link clicks</th>
                  <th className="px-3 py-3 font-semibold">Site actions</th>
                  <th className="px-3 py-3 font-semibold">Sign-ups/submissions</th>
                </tr>
              </thead>
              <tbody>
                {attributionSummary.sources.map((source) => (
                  <tr key={source.source} className="border-b border-[#DDB765]/40 last:border-0">
                    <th scope="row" className="px-3 py-3 font-semibold capitalize">{source.source}</th>
                    <td className="px-3 py-3">{source.linkClicks}</td>
                    <td className="px-3 py-3">{source.ctaClicks}</td>
                    <td className="px-3 py-3">{source.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-10 max-w-7xl overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#123C39] px-6 py-7 text-[#FFF3DF] shadow-xl shadow-[#1C5A50]/15 md:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[#DDB765]">Recipe of the Month</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">This month&apos;s voting</h2>
            <p className="mt-2 text-sm leading-6 text-[#EED8B2]">
              {recipeOfMonthResults
                ? `${recipeOfMonthResults.totalVotes} ${recipeOfMonthResults.totalVotes === 1 ? "vote has" : "votes have"} been cast in ${new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" }).format(new Date(`${recipeOfMonthResults.monthKey}-01T12:00:00Z`))}.`
                : "Voting results will appear here once the new voting table is live."}
            </p>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#EED8B2]">At month-end, use the leading recipe as your clear winner, then announce it through the homepage and social channels.</p>
        </div>
        {recipeOfMonthResults ? (
          monthlyVoteLeaders.length ? (
            <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {monthlyVoteLeaders.map(([recipeKey, votes], index) => (
                <li key={recipeKey} className="rounded-2xl border border-[#DDB765]/60 bg-white/10 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#DDB765]">{index === 0 ? "Leading recipe" : `Place ${index + 1}`}</p>
                  <p className="mt-2 font-bold text-white">{recipeVoteLabels.get(recipeKey) ?? "A recipe shared with OPR"}</p>
                  <p className="mt-1 text-sm text-[#EED8B2]">{votes} {votes === 1 ? "vote" : "votes"}</p>
                </li>
              ))}
            </ol>
          ) : <p className="mt-6 rounded-2xl border border-[#DDB765]/60 bg-white/10 px-4 py-4 text-sm text-[#EED8B2]">No votes yet. The first visitor can choose the recipe that should take this month&apos;s table.</p>
        ) : null}
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-xl shadow-[#1C5A50]/10">
          <div className="border-b border-[#DDB765]/70 px-6 py-5">
            <h2 className="text-xl font-bold">All submissions</h2>
          </div>
          <div className="divide-y divide-[#DDB765]/50">
            {loading ? <p className="p-6 text-stone-600">Loading recipes...</p> : null}
            {!loading && submissions.length === 0 ? (
              <p className="p-6 leading-7 text-stone-700">No recipes have arrived yet.</p>
            ) : null}
            {submissions.map((submission) => (
              <button
                type="button"
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="w-full px-6 py-5 text-left transition hover:bg-[#EED8B2]/65"
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
                  className="rounded-full border border-[#DDB765] bg-[#EED8B2] px-4 py-2.5 text-sm font-medium capitalize outline-none"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="selected">Selected</option>
                </select>
              </div>

              <div className="mt-7 rounded-2xl border border-[#DDB765]/70 bg-[#EED8B2]/45 p-5 md:flex md:items-center md:justify-between md:gap-6">
                <div>
                  <h3 className="font-bold">{selectedSubmission.is_published ? "Live in the Living Cookbook" : "Approve and publish"}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-700">
                    {selectedSubmission.is_published
                      ? "This recipe is visible to everyone in the public cookbook."
                      : "When you approve it, this recipe, its story and its photo become visible in the public Living Cookbook."}
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

              <div className="mt-5 rounded-2xl border border-[#DDB765]/70 bg-[#FFF3DF] p-5">
                <div className="md:flex md:items-start md:justify-between md:gap-6">
                  <div>
                    <h3 className="font-bold">
                      {selectedSubmission.is_recipe_of_week ? "This is Recipe of the Month" : "Feature this recipe on the homepage"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-stone-700">
                      Choose one published recipe at a time. It will become the homepage&apos;s monthly story.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void toggleRecipeOfWeek(selectedSubmission)}
                    className="mt-4 rounded-full bg-[#9A622A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B431E] md:mt-0"
                  >
                    {selectedSubmission.is_recipe_of_week ? "Remove as Recipe of the Month" : "Make Recipe of the Month"}
                  </button>
                </div>
                <label className="mt-5 block text-sm font-medium">
                  Why this recipe this month? <span className="font-normal text-stone-500">(optional)</span>
                  <textarea
                    value={selectedSubmission.recipe_of_week_note ?? ""}
                    onChange={(event) => updateRecipeOfWeekNote(event.target.value)}
                    rows={3}
                    placeholder="For example: A family favourite that deserves a place at the centre of the table."
                    className="mt-3 w-full resize-y rounded-xl border border-[#DDB765] bg-white px-4 py-3 leading-6 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#DDB765]/60"
                  />
                </label>
              </div>

              <div className="mt-10 space-y-8 text-stone-700">
                {selectedPhotoUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Recipe photo</h3>
                    <Image
                      src={selectedPhotoUrl}
                      alt={selectedSubmission.title}
                      width={1200}
                      height={900}
                      unoptimized
                      className="mt-4 max-h-[28rem] w-full rounded-2xl object-cover shadow-lg"
                    />
                  </article>
                ) : null}
                {selectedContributorPhotoUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">Meet the cook</h3>
                    <div className="mt-4 flex items-center gap-4">
                      <Image
                        src={selectedContributorPhotoUrl}
                        alt={`${selectedSubmission.name}, who shared ${selectedSubmission.title}`}
                        width={96}
                        height={96}
                        unoptimized
                        className="h-24 w-24 rounded-full object-cover shadow-lg"
                      />
                      <p className="font-medium text-[#123C39]">{selectedSubmission.name}</p>
                    </div>
                  </article>
                ) : null}
                {selectedOriginalRecipeUrl ? (
                  <article>
                    <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#123C39]">The original recipe</h3>
                    <Image
                      src={selectedOriginalRecipeUrl}
                      alt={`The original recipe for ${selectedSubmission.title}`}
                      width={1200}
                      height={1600}
                      unoptimized
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
                <p className="border-t border-[#DDB765]/70 pt-6 text-sm">
                  Contact: <a className="underline" href={`mailto:${selectedSubmission.email}`}>{selectedSubmission.email}</a>
                  {selectedSubmission.servings ? ` · Serves ${selectedSubmission.servings}` : ""}
                  {selectedSubmission.prep_time_minutes ? ` · Prep ${selectedSubmission.prep_time_minutes} min` : ""}
                  {selectedSubmission.cook_time_minutes ? ` · Cook ${selectedSubmission.cook_time_minutes} min` : ""}
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
        <div className="border-b border-[#DDB765]/70 px-6 py-5 md:px-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Cooked by our community</p>
          <h2 className="mt-2 text-2xl font-bold">Community posts awaiting your review</h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">Approve a post to show it on the recipe page, hide it again at any time, or remove it permanently.</p>
        </div>
        {communityCooks.length ? (
          <div className="divide-y divide-[#DDB765]/50">
            {communityCooks.map((cook) => {
              const photoUrl = communityCookPhotoUrl(cook);
              return (
                <article key={cook.id} className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
                  <div className="flex min-w-0 items-center gap-4">
                    {photoUrl ? <Image src={photoUrl} alt="" width={64} height={64} unoptimized className="h-16 w-16 shrink-0 rounded-full object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EED8B2] font-bold">{cook.name.charAt(0).toUpperCase()}</div>}
                    <div>
                      <p className="font-bold">{cook.name} <span className="font-normal text-stone-500">cooked {cook.recipe_submissions?.title ?? cook.recipe_title ?? "an OPR recipe"}</span></p>
                      {cook.note ? <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-700">“{cook.note}”</p> : <p className="mt-1 text-sm text-stone-500">No note supplied.</p>}
                      <p className={`mt-2 text-xs font-bold uppercase tracking-[0.18em] ${cook.is_approved ? "text-[#1C5A50]" : "text-[#9A622A]"}`}>{cook.is_approved ? "Live on recipe page" : "Awaiting approval"}</p>
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
