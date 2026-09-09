export type SeoIssueSeverity = "critical" | "warning" | "info";

export type SeoIssue = {
  code: string;
  label: string;
  severity: SeoIssueSeverity;
  deduction: number;
};

export type SeoAuditInput = {
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  excerpt: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: { name: string }[];
  sources: { url: string }[];
  sections: { id: string }[];
  faq: { id: string }[];
  featuredImage: { altText: string | null } | null;
};

export type SeoAuditResult = {
  score: number;
  grade: "Excellent" | "Good" | "Needs work" | "Poor";
  issues: SeoIssue[];
};

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function auditArticleSeo(article: SeoAuditInput): SeoAuditResult {
  const issues: SeoIssue[] = [];
  const add = (code: string, label: string, severity: SeoIssueSeverity, deduction: number) => issues.push({ code, label, severity, deduction });
  const seoTitle = article.seoTitle?.trim() ?? "";
  const description = article.seoDescription?.trim() ?? "";
  const excerpt = article.excerpt.trim();

  if (!seoTitle) add("seo-title-missing", "Missing SEO title", "critical", 15);
  else if (seoTitle.length < 30) add("seo-title-short", `SEO title is short (${seoTitle.length} chars)`, "warning", 7);
  else if (seoTitle.length > 65) add("seo-title-long", `SEO title is long (${seoTitle.length} chars)`, "warning", 7);

  if (!description) add("meta-missing", "Missing SEO description", "critical", 15);
  else if (description.length < 120) add("meta-short", `SEO description is short (${description.length} chars)`, "warning", 7);
  else if (description.length > 170) add("meta-long", `SEO description is long (${description.length} chars)`, "warning", 7);

  if (excerpt.length < 80) add("excerpt-short", "Excerpt is too short for strong search/card context", "info", 4);
  if (article.tags.length < 3) add("tags-low", `Only ${article.tags.length} tag${article.tags.length === 1 ? "" : "s"}`, "warning", 8);
  if (article.sources.length < 2) add("sources-low", `Only ${article.sources.length} source${article.sources.length === 1 ? "" : "s"}`, "warning", 8);
  if (article.sources.some(source => !validHttpUrl(source.url))) add("source-invalid", "One or more source URLs are invalid", "critical", 8);
  if (article.sections.length < 3) add("sections-low", `Only ${article.sections.length} structured section${article.sections.length === 1 ? "" : "s"}`, "warning", 7);
  if (article.faq.length < 2) add("faq-low", "Less than 2 FAQ entries", "info", 4);

  if (!article.featuredImage) add("image-missing", "No featured image; KitsuWire artwork fallback is used", "info", 6);
  else if (!article.featuredImage.altText?.trim()) add("alt-missing", "Featured image is missing alt text", "critical", 8);

  const freshnessBase = article.updatedAt ?? article.publishedAt;
  if (article.status === "PUBLISHED" && freshnessBase) {
    const ageDays = Math.floor((Date.now() - freshnessBase.getTime()) / 86_400_000);
    if (ageDays > 365) add("stale", `Content has not been updated for ${ageDays} days`, "warning", 6);
  }

  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + issue.deduction, 0));
  const grade = score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 55 ? "Needs work" : "Poor";
  return { score, grade, issues };
}
