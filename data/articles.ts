export type Category = "ai" | "technology" | "software" | "markets";

export type Article = {
  slug: string;
  category: Category;
  categoryLabel: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  tone: "violet" | "blue" | "orange" | "green";
  featured?: boolean;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "ai-is-no-longer-just-a-software-story",
    category: "ai",
    categoryLabel: "AI",
    title: "AI is no longer just a software story.",
    excerpt: "The biggest technology shift of the decade is colliding with energy, chips, geopolitics and capital markets.",
    publishedAt: "2026-09-08",
    readingTime: "12 min",
    tone: "violet",
    featured: true,
    body: [
      "Artificial intelligence is moving from the software layer into the physical economy. Training and running advanced models now depends on data centers, electricity, chips, cooling systems and enormous capital budgets.",
      "That changes the way the AI story should be understood. The winners may not only be the companies building the smartest models, but also the companies controlling scarce compute, distribution, infrastructure and energy access.",
      "For investors, builders and operators, the important question is no longer simply which model is best. It is which ecosystem can scale reliably, cheaply and globally."
    ]
  },
  {
    slug: "the-next-ai-race-is-moving-beyond-bigger-models",
    category: "ai",
    categoryLabel: "AI",
    title: "The next AI race is moving beyond bigger models",
    excerpt: "Why agents, infrastructure and distribution are becoming the new battleground.",
    publishedAt: "2026-09-07",
    readingTime: "6 min",
    tone: "violet",
    body: [
      "Model capability still matters, but the competition is broadening. Companies are racing to make AI useful inside real workflows rather than simply impressive in benchmarks.",
      "Agents, tool use, context, memory and enterprise integration are becoming increasingly important parts of the product experience.",
      "Distribution may prove just as important as raw intelligence. The companies already embedded in daily workflows have a powerful advantage when AI becomes a default layer of software."
    ]
  },
  {
    slug: "the-invisible-infrastructure-powering-the-new-internet",
    category: "technology",
    categoryLabel: "Technology",
    title: "The invisible infrastructure powering the new internet",
    excerpt: "Inside the data centers, chips and networks behind the next computing cycle.",
    publishedAt: "2026-09-06",
    readingTime: "8 min",
    tone: "blue",
    body: [
      "The modern internet increasingly depends on infrastructure most users never see. Data centers, accelerators, high-speed interconnects and cooling systems now sit behind many of the fastest-growing digital products.",
      "As demand rises, infrastructure becomes a strategic constraint rather than a background commodity.",
      "The next wave of technology may therefore be shaped as much by physical capacity as by software innovation."
    ]
  },
  {
    slug: "software-is-changing-from-tools-into-teammates",
    category: "software",
    categoryLabel: "Software",
    title: "Software is changing from tools into teammates",
    excerpt: "A practical look at how AI-native products are reshaping everyday workflows.",
    publishedAt: "2026-09-05",
    readingTime: "5 min",
    tone: "orange",
    body: [
      "Traditional software waits for a user to tell it exactly what to do. AI-native software increasingly interprets goals, suggests actions and executes multi-step tasks.",
      "This changes product design. Interfaces become more conversational, software becomes more proactive and workflows become less dependent on manual navigation.",
      "The challenge is trust: users need systems that are not only capable, but predictable, transparent and controllable."
    ]
  },
  {
    slug: "why-investors-are-watching-compute-like-a-commodity",
    category: "markets",
    categoryLabel: "Markets",
    title: "Why investors are watching compute like a commodity",
    excerpt: "AI demand is changing how markets think about power, chips and capacity.",
    publishedAt: "2026-09-04",
    readingTime: "7 min",
    tone: "green",
    body: [
      "Compute has become one of the most closely watched inputs in the AI economy. Access to powerful accelerators can affect growth, product launches and margins.",
      "That has made infrastructure spending a central market signal. Investors now pay close attention to capital expenditure, data-center expansion and power availability.",
      "The result is a tighter connection between technology markets and traditionally industrial sectors such as utilities, construction and energy."
    ]
  }
];

export const categoryMeta: Record<Category, { title: string; description: string }> = {
  ai: { title: "Artificial Intelligence", description: "Models, agents, companies and the infrastructure powering the AI era." },
  technology: { title: "Technology", description: "The products, platforms and breakthroughs changing how the world works." },
  software: { title: "Software", description: "Developer tools, cloud, open source and the new software stack." },
  markets: { title: "Markets", description: "The money, businesses and economic forces behind technological change." }
};

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: Category) {
  return articles.filter((article) => article.category === category);
}
