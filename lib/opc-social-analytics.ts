import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { UnmatchedSocialPost } from "./admin-analytics-types";
import { getFacebookSummary } from "./facebook";
import { getInstagramSummary } from "./instagram";
import { getLinkedInSummary } from "./linkedin";
import { loadOpcFilms } from "./opc-film-catalog";
import { getPinterestFilmViews, getPinterestSummary } from "./pinterest";
import { getTikTokSummary } from "./tiktok";
import { getYouTubeSummary } from "./youtube";

type Platform = UnmatchedSocialPost["platform"];
type SocialPost = { id: string; title: string; views: number; permalink?: string };
type StoredPost = {
  platform: Platform;
  post_id: string;
  post_title: string;
  film_video: string | null;
  metric_value: number;
  ignored: boolean;
};

function sourceUrl(platform: Platform, post: SocialPost) {
  if (platform === "instagram" && post.permalink?.startsWith("https://www.instagram.com/")) return post.permalink;
  if (platform === "facebook" && /^\d+$/.test(post.id)) return `https://www.facebook.com/watch/?v=${post.id}`;
  if (platform === "tiktok" && /^\d+$/.test(post.id)) return `https://www.tiktok.com/@otherpeoplescocktails/video/${post.id}`;
  if (platform === "youtube" && /^[\w-]{11}$/.test(post.id)) return `https://www.youtube.com/watch?v=${post.id}`;
  if (platform === "pinterest" && /^\d+$/.test(post.id)) return `https://www.pinterest.com/pin/${post.id}/`;
  if (platform === "linkedin" && /^urn:li:(ugcPost|share):\d+$/.test(post.id)) return `https://www.linkedin.com/feed/update/${post.id}/`;
}

export const opcPostTable = "opc_social_film_posts";

export async function loadOpcSocialAnalytics(client: SupabaseClient, forceRefresh: boolean) {
  const options = { brand: "opc", forceRefresh } as const;
  const [facebook, instagram, tiktok, youtube, pinterest, linkedin, opcFilms] = await Promise.all([
    getFacebookSummary(options), getInstagramSummary(options), getTikTokSummary(options),
    getYouTubeSummary(options), getPinterestSummary(options), getLinkedInSummary(options), loadOpcFilms(),
  ]);
  const pinterestFilms = pinterest ? await getPinterestFilmViews(options) : null;
  const connections = [
    { platform: "facebook", summary: facebook, activity: facebook?.views28d, followers: facebook?.followers, metric: "Views", posts: facebook?.films },
    { platform: "instagram", summary: instagram, activity: instagram?.views28d, followers: instagram?.followers, metric: "Views", posts: instagram?.films },
    { platform: "tiktok", summary: tiktok, activity: tiktok?.views28d, followers: tiktok?.followers, metric: "Video views", posts: tiktok?.films },
    { platform: "youtube", summary: youtube, activity: youtube?.views28d, followers: youtube?.subscribers, metric: "Video views", posts: youtube?.films },
    { platform: "pinterest", summary: pinterest, activity: pinterest?.impressions28d, followers: pinterest?.followers, metric: "Impressions", posts: pinterestFilms?.films },
    { platform: "linkedin", summary: linkedin, activity: linkedin?.pageViews28d, followers: linkedin?.followers, metric: "Page views", posts: linkedin?.films },
  ] as const;
  const result = await client.from(opcPostTable).select("platform,post_id,post_title,film_video,metric_value,ignored");
  if (result.error) throw new Error("OPC film matches could not be loaded.");
  const posts = new Map(((result.data ?? []) as StoredPost[]).map((post) => [`${post.platform}:${post.post_id}`, post]));
  const refreshed = connections.flatMap(({ platform, posts: livePosts }) => (livePosts ?? []).filter((post) => post.id).map((post) => ({
    platform, post_id: post.id, post_title: post.title, metric_value: post.views,
    last_synced_at: new Date().toISOString(),
  })));
  if (refreshed.length) {
    const { error } = await client.from(opcPostTable).upsert(refreshed, { onConflict: "platform,post_id" });
    if (error) throw new Error("OPC social metrics could not be saved.");
  }
  const originalLinks = new Map<string, string>();
  for (const { platform, posts: livePosts } of connections) {
    for (const post of livePosts ?? []) {
      const url = sourceUrl(platform, post);
      if (url) originalLinks.set(`${platform}:${post.id}`, url);
    }
  }
  for (const post of refreshed) {
    const key = `${post.platform}:${post.post_id}`;
    posts.set(key, { film_video: null, ignored: false, ...posts.get(key), ...post });
  }
  const active = [...posts.values()].filter((post) => !post.ignored);
  return {
    connections: connections.map(({ platform, summary, activity, followers, metric }) => ({
      platform, connected: Boolean(summary && (platform !== "linkedin" || activity != null || linkedin?.films.length)),
      partial: platform === "linkedin" ? Boolean(linkedin?.filmError) : platform === "pinterest" && Boolean(pinterest && !pinterestFilms),
      period: summary?.period ?? null, fetchedAt: summary?.fetchedAt ?? null,
      activity: activity ?? null, followers: followers ?? null, metric,
    })),
    films: opcFilms.map((film) => ({
      ...film,
      metrics: connections.map(({ platform }) => {
        const matches = active.filter((post) => post.platform === platform && post.film_video === film.id);
        return { platform, value: matches.length ? matches.reduce((total, post) => total + Number(post.metric_value), 0) : null };
      }),
    })),
    unmatched: active.filter((post) => !post.film_video).map((post) => ({
      platform: post.platform, postId: post.post_id, title: post.post_title, metricValue: post.metric_value,
      sourceUrl: originalLinks.get(`${post.platform}:${post.post_id}`) ?? sourceUrl(post.platform, {
        id: post.post_id, title: post.post_title, views: post.metric_value,
      }),
    })),
  };
}

export type OpcSocialAnalytics = Awaited<ReturnType<typeof loadOpcSocialAnalytics>>;
