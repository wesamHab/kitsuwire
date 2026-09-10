import "server-only";
import { db } from "@/lib/db";

export type AnalyticsOverview = {
  views24h: number;
  views7d: number;
  views30d: number;
  articleViews30d: number;
  visitors30d: number;
  sessions30d: number;
  returningVisitors30d: number;
  newVisitors30d: number;
  pagesPerSession30d: number;
  avgSessionSeconds30d: number;
  singlePageSessionRate30d: number;
  topArticles: Array<{ slug: string; views: number }>;
  topPaths: Array<{ path: string; views: number }>;
  landingPages: Array<{ path: string; sessions: number }>;
  exitPages: Array<{ path: string; sessions: number }>;
  referrers: Array<{ host: string; views: number }>;
  daily: Array<{ day: string; views: number }>;
};

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

function isMissingAnalyticsColumns(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; meta?: { code?: string; message?: string }; message?: string };
  return candidate.code === "P2010" && (candidate.meta?.code === "42703" || candidate.meta?.message?.includes("visitorId") || candidate.message?.includes("visitorId"));
}

async function baseAnalytics(since24h: Date, since7d: Date, since30d: Date) {
  const [views24h, views7d, views30d, articleViews30d, topArticlesRaw, topPathsRaw, referrersRaw, dailyRaw] = await Promise.all([
    db.pageView.count({ where: { createdAt: { gte: since24h } } }),
    db.pageView.count({ where: { createdAt: { gte: since7d } } }),
    db.pageView.count({ where: { createdAt: { gte: since30d } } }),
    db.pageView.count({ where: { createdAt: { gte: since30d }, articleSlug: { not: null } } }),
    db.$queryRaw<Array<{ slug: string; views: bigint }>>`
      SELECT "articleSlug" AS slug, COUNT(*)::bigint AS views
      FROM "PageView"
      WHERE "createdAt" >= ${since30d} AND "articleSlug" IS NOT NULL
      GROUP BY "articleSlug"
      ORDER BY views DESC
      LIMIT 10
    `,
    db.$queryRaw<Array<{ path: string; views: bigint }>>`
      SELECT path, COUNT(*)::bigint AS views
      FROM "PageView"
      WHERE "createdAt" >= ${since30d}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `,
    db.$queryRaw<Array<{ host: string; views: bigint }>>`
      SELECT "referrerHost" AS host, COUNT(*)::bigint AS views
      FROM "PageView"
      WHERE "createdAt" >= ${since30d} AND "referrerHost" IS NOT NULL
      GROUP BY "referrerHost"
      ORDER BY views DESC
      LIMIT 10
    `,
    db.$queryRaw<Array<{ day: Date; views: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS views
      FROM "PageView"
      WHERE "createdAt" >= ${since30d}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day ASC
    `,
  ]);
  return { views24h, views7d, views30d, articleViews30d, topArticlesRaw, topPathsRaw, referrersRaw, dailyRaw };
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const since24h = daysAgo(1);
  const since7d = daysAgo(7);
  const since30d = daysAgo(30);
  const base = await baseAnalytics(since24h, since7d, since30d);

  try {
    const [visitorsRaw, sessionsRaw, returningRaw, sessionStatsRaw, landingRaw, exitRaw] = await Promise.all([
      db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT "visitorId")::bigint AS count
        FROM "PageView"
        WHERE "createdAt" >= ${since30d} AND "visitorId" IS NOT NULL
      `,
      db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT "sessionId")::bigint AS count
        FROM "PageView"
        WHERE "createdAt" >= ${since30d} AND "sessionId" IS NOT NULL
      `,
      db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT recent."visitorId")::bigint AS count
        FROM "PageView" recent
        WHERE recent."createdAt" >= ${since30d}
          AND recent."visitorId" IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM "PageView" older
            WHERE older."visitorId" = recent."visitorId"
              AND older."createdAt" < ${since30d}
          )
      `,
      db.$queryRaw<Array<{ avg_seconds: number | null; single_page: bigint; total: bigint }>>`
        WITH sessions AS (
          SELECT "sessionId", MIN("createdAt") AS first_seen, MAX("createdAt") AS last_seen, COUNT(*)::bigint AS views
          FROM "PageView"
          WHERE "createdAt" >= ${since30d} AND "sessionId" IS NOT NULL
          GROUP BY "sessionId"
        )
        SELECT
          AVG(EXTRACT(EPOCH FROM (last_seen - first_seen)))::float AS avg_seconds,
          COUNT(*) FILTER (WHERE views = 1)::bigint AS single_page,
          COUNT(*)::bigint AS total
        FROM sessions
      `,
      db.$queryRaw<Array<{ path: string; sessions: bigint }>>`
        WITH ranked AS (
          SELECT "sessionId", path, ROW_NUMBER() OVER (PARTITION BY "sessionId" ORDER BY "createdAt" ASC, id ASC) AS rn
          FROM "PageView"
          WHERE "createdAt" >= ${since30d} AND "sessionId" IS NOT NULL
        )
        SELECT path, COUNT(*)::bigint AS sessions
        FROM ranked WHERE rn = 1
        GROUP BY path ORDER BY sessions DESC LIMIT 10
      `,
      db.$queryRaw<Array<{ path: string; sessions: bigint }>>`
        WITH ranked AS (
          SELECT "sessionId", path, ROW_NUMBER() OVER (PARTITION BY "sessionId" ORDER BY "createdAt" DESC, id DESC) AS rn
          FROM "PageView"
          WHERE "createdAt" >= ${since30d} AND "sessionId" IS NOT NULL
        )
        SELECT path, COUNT(*)::bigint AS sessions
        FROM ranked WHERE rn = 1
        GROUP BY path ORDER BY sessions DESC LIMIT 10
      `,
    ]);

    const visitors30d = Number(visitorsRaw[0]?.count ?? 0);
    const sessions30d = Number(sessionsRaw[0]?.count ?? 0);
    const returningVisitors30d = Number(returningRaw[0]?.count ?? 0);
    const sessionStats = sessionStatsRaw[0];
    const sessionTotal = Number(sessionStats?.total ?? 0);
    const singlePageSessions = Number(sessionStats?.single_page ?? 0);

    return {
      views24h: base.views24h,
      views7d: base.views7d,
      views30d: base.views30d,
      articleViews30d: base.articleViews30d,
      visitors30d,
      sessions30d,
      returningVisitors30d,
      newVisitors30d: Math.max(0, visitors30d - returningVisitors30d),
      pagesPerSession30d: sessions30d ? Math.round((base.views30d / sessions30d) * 100) / 100 : 0,
      avgSessionSeconds30d: Math.max(0, Math.round(Number(sessionStats?.avg_seconds ?? 0))),
      singlePageSessionRate30d: sessionTotal ? Math.round((singlePageSessions / sessionTotal) * 1000) / 10 : 0,
      topArticles: base.topArticlesRaw.map(row => ({ slug: row.slug, views: Number(row.views) })),
      topPaths: base.topPathsRaw.map(row => ({ path: row.path, views: Number(row.views) })),
      landingPages: landingRaw.map(row => ({ path: row.path, sessions: Number(row.sessions) })),
      exitPages: exitRaw.map(row => ({ path: row.path, sessions: Number(row.sessions) })),
      referrers: base.referrersRaw.map(row => ({ host: row.host, views: Number(row.views) })),
      daily: base.dailyRaw.map(row => ({ day: row.day.toISOString().slice(0, 10), views: Number(row.views) })),
    };
  } catch (error) {
    if (!isMissingAnalyticsColumns(error)) throw error;
    return {
      views24h: base.views24h,
      views7d: base.views7d,
      views30d: base.views30d,
      articleViews30d: base.articleViews30d,
      visitors30d: 0,
      sessions30d: 0,
      returningVisitors30d: 0,
      newVisitors30d: 0,
      pagesPerSession30d: 0,
      avgSessionSeconds30d: 0,
      singlePageSessionRate30d: 0,
      topArticles: base.topArticlesRaw.map(row => ({ slug: row.slug, views: Number(row.views) })),
      topPaths: base.topPathsRaw.map(row => ({ path: row.path, views: Number(row.views) })),
      landingPages: [],
      exitPages: [],
      referrers: base.referrersRaw.map(row => ({ host: row.host, views: Number(row.views) })),
      daily: base.dailyRaw.map(row => ({ day: row.day.toISOString().slice(0, 10), views: Number(row.views) })),
    };
  }
}
