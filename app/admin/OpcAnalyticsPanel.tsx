"use client";

import { useEffect, useState } from "react";
import type { OpcSocialAnalytics } from "../../lib/opc-social-analytics";
import type { SocialBrand } from "../../lib/social-brand";
import AnalyticsBrandSwitch from "./AnalyticsBrandSwitch";

const number = new Intl.NumberFormat("en-GB");
const platformNames = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", pinterest: "Pinterest", tiktok: "TikTok", youtube: "YouTube" };
const buttonClass = "rounded-full border border-[#123C39] px-4 py-2 text-sm font-semibold disabled:opacity-50";

type Props = {
  request: (path: string, options?: RequestInit) => Promise<Response>;
  oauthStatus?: string;
  oauthPlatform?: string;
  onChangeBrand: (brand: SocialBrand) => void;
  onSignOut: () => void;
};

export default function OpcAnalyticsPanel({ request, oauthStatus, oauthPlatform, onChangeBrand, onSignOut }: Props) {
  const [analytics, setAnalytics] = useState<OpcSocialAnalytics | null>(null);
  const [revision, setRevision] = useState(oauthStatus === "connected" ? 1 : 0);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const platformLabel = platformNames[oauthPlatform as keyof typeof platformNames] || "Social";
  const oauthMessage = oauthStatus === "connected" ? `${platformLabel} authorised. Checking the available OPC metrics.`
    : oauthStatus === "wrong-account" ? "The account did not match the verified OPC profile. No connection was saved."
    : oauthStatus === "denied" ? "Authorisation was declined. No connection was saved."
    : oauthStatus === "expired" ? "This authorisation attempt is no longer active. Start again from this dashboard in the same browser."
    : oauthStatus === "meta-token" ? "Meta did not issue a usable credential. Start a fresh authorisation for the OPC Page."
    : oauthStatus === "meta-page" ? "Meta did not return access to the Other People’s Cocktails Page. Select that Page and grant read access."
    : oauthStatus === "meta-insights" ? "Meta returned a credential, but it could not be verified for the OPC Page."
    : oauthStatus === "failed" ? `${platformLabel} could not be connected. Check provider access and try again.` : "";

  async function connect(platform: "facebook" | "tiktok" | "youtube" | "pinterest") {
    setConnecting(platform);
    setError("");
    try {
      const response = await request("/api/admin/social-connect", {
        method: "POST", body: JSON.stringify({ brand: "opc", platform }),
      });
      const payload = await response.json();
      if (!response.ok || typeof payload.url !== "string") throw new Error();
      window.location.assign(payload.url);
    } catch {
      setError(`${platformNames[platform]} authorisation could not be started.`);
      setConnecting(null);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const path = `/api/admin/analytics/opc${revision > 0 ? "?refresh=1" : ""}`;
    void request(path, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("OPC analytics could not be loaded.");
      setAnalytics(await response.json() as OpcSocialAnalytics);
    }).catch(() => {
      if (!controller.signal.aborted) setError("OPC analytics could not be loaded.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [request, revision]);

  async function saveMatch(post: OpcSocialAnalytics["unmatched"][number], key: string) {
    setMatching(key);
    setError("");
    setNotice("");
    try {
      const response = await request("/api/admin/social-film-match", {
        method: "PATCH",
        body: JSON.stringify({ brand: "opc", platform: post.platform, postId: post.postId, filmVideo: selections[key] }),
      });
      if (!response.ok) throw new Error("The match could not be saved.");
      const updated = await request("/api/admin/analytics/opc");
      if (!updated.ok) {
        setNotice("Match saved. Refresh to load the updated dashboard.");
        return;
      }
      setAnalytics(await updated.json());
      setNotice("Match saved.");
    } catch {
      setError("The OPC film match could not be confirmed. Refresh before retrying.");
    } finally {
      setMatching(null);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] px-4 py-8 text-[#123C39] md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm uppercase tracking-widest text-amber-800">Private OPC area</p>
          <h1 className="mt-2 text-4xl font-bold">Analytics dashboard</h1>
          <AnalyticsBrandSwitch brand="opc" onChange={onChangeBrand} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className={buttonClass} disabled={loading || matching !== null}
              onClick={() => { setLoading(true); setError(""); setRevision((value) => value + 1); }}>
              {loading ? "Loading…" : "Refresh dashboard"}
            </button>
            <button type="button" className={buttonClass} onClick={onSignOut}>Sign out</button>
            <a href="https://otherpeoplescocktails.co.uk/admin/analytics" className="text-sm font-semibold underline">OPC website traffic</a>
          </div>
        </header>
        {error && <p role="alert">{error}</p>}
        {oauthMessage && <p role="status">{oauthMessage}</p>}
        {notice && <p role="status">{notice}</p>}
        {analytics && <>
          <section aria-labelledby="opc-connections" className="rounded-3xl bg-[#FFF3DF] p-5">
            <h2 id="opc-connections" className="text-2xl font-bold">Social data connections</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.connections.map((item) => (
                <article key={item.platform} className="rounded-xl border border-[#B69963] p-4">
                  <h3 className="font-bold">{platformNames[item.platform]}</h3>
                  <p className="text-sm">{item.connected ? item.partial ? "Some metrics unavailable" : "Connected" : "OPC connection needs authorising"}</p>
                  {item.platform !== "linkedin" && item.platform !== "instagram" && (
                    <button type="button" className={`mt-3 ${buttonClass}`} disabled={connecting !== null}
                      onClick={() => void connect(item.platform as "facebook" | "tiktok" | "youtube" | "pinterest")}>
                      {connecting === item.platform ? "Opening authorisation…" : item.platform === "facebook"
                        ? "Authorise Facebook and Instagram" : `Authorise ${platformNames[item.platform]}`}
                    </button>
                  )}
                  {item.platform === "instagram" && !item.connected && <p className="mt-2 text-sm">Authorise the linked account in the Facebook connection.</p>}
                  {item.connected && <dl className="mt-2 text-sm">
                    <dt>{item.metric}{item.period ? ` · ${item.period}` : ""}</dt>
                    <dd>{item.activity === null ? "Not reported" : number.format(item.activity)}</dd>
                    <dt>{item.platform === "youtube" ? "Subscribers" : "Followers"}</dt>
                    <dd>{item.followers === null ? "Not reported" : number.format(item.followers)}</dd>
                    {item.fetchedAt && <><dt>Last fetched</dt><dd><time dateTime={item.fetchedAt}>{new Date(item.fetchedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}</time></dd></>}
                  </dl>}
                </article>
              ))}
            </div>
          </section>
          <section aria-labelledby="opc-matching" className="rounded-3xl bg-[#FFF3DF] p-5">
            <h2 id="opc-matching" className="text-2xl font-bold">Unresolved film posts</h2>
            {!analytics.unmatched.length && <p className="mt-2">No unresolved posts from available feeds.</p>}
            <ul className="mt-3 space-y-4">
              {analytics.unmatched.map((post) => {
                const key = `${post.platform}:${post.postId}`;
                return (
                  <li key={key} className="rounded-xl border border-[#B69963] p-4">
                    <p className="font-bold">{platformNames[post.platform]}</p>
                    <p className="my-2 break-words">{post.title}</p>
                    <p className="break-all text-sm">Post ID: {post.postId}</p>
                    {post.sourceUrl && <a className="text-sm underline" href={post.sourceUrl} target="_blank" rel="noreferrer">Review original post</a>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <select aria-label={`Match ${platformNames[post.platform]} post ${post.postId} to OPC film`}
                        value={selections[key] ?? ""} className="max-w-full rounded-xl border border-[#123C39] bg-white p-2"
                        onChange={(event) => setSelections((current) => ({ ...current, [key]: event.target.value }))}>
                        <option value="">Choose the matching OPC film</option>
                        {analytics.films.map((film) => <option key={film.id} value={film.id}>{film.title}</option>)}
                      </select>
                      <button type="button" className={buttonClass} disabled={!selections[key] || matching !== null || loading}
                        onClick={() => void saveMatch(post, key)}>Save match</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          <section aria-labelledby="opc-films" className="rounded-3xl bg-[#FFF3DF] p-5">
            <h2 id="opc-films" className="text-2xl font-bold">Film performance</h2>
            <p className="my-2 text-sm">Pinterest reports impressions. Other platforms report views using their own definitions.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr><th scope="col" className="p-2">Film</th>{analytics.connections.map(({ platform }) => <th key={platform} scope="col" className="p-2">{platformNames[platform]}</th>)}</tr></thead>
                <tbody>{analytics.films.map((film) => (
                  <tr key={film.id}>
                    <th scope="row" className="p-2"><a className="underline" href={`https://otherpeoplescocktails.co.uk/films/${film.id}`}>{film.title}</a></th>
                    {film.metrics.map(({ platform, value }) => <td key={platform} className="p-2">{value === null ? "Not reported" : number.format(value)}</td>)}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </>}
      </div>
    </main>
  );
}
