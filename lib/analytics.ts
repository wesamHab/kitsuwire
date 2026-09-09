import "server-only";
import { db } from "@/lib/db";

export type AnalyticsOverview = {
  views24h: number;
  views7d: number;
  views30d: number;
  articleViews30d: number;
  topArticles: Array<{ slug: string; views: number }>;
  topPaths: Array<{ path: string; views: number }>;
  referrers: Array<{ host: string; views: number }>;
  daily: Array<{ day: string; views: number }>;
};

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const since24h = daysAgo(1);
  const since7d = daysAgo(7);
  const since30d = daysAgo(30);

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

  return {
    views24h,
    views7d,
    views30d,
    articleViews30d,
    topArticles: topArticlesRaw.map(row => ({ slug: row.slug, views: Number(row.views) })),
    topPaths: topPathsRaw.map(row => ({ path: row.path, views: Number(row.views) })),
    referrers: referrersRaw.map(row => ({ host: row.host, views: Number(row.views) })),
    daily: dailyRaw.map(row => ({ day: row.day.toISOString().slice(0, 10), views: Number(row.views) })),
  };
}
