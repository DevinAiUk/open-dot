import "server-only";

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

/**
 * Fast, lightweight web search for dots running on local / open models without native search plugins.
 */
export async function webSearch(query: string, limit = 5): Promise<string> {
  const q = query.trim();
  if (!q) return "Please provide a non-empty search query.";

  const results: SearchResult[] = [];

  // 1. Fetch from Hacker News Algolia (instant tech, AI, software, research news)
  try {
    const hnRes = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=${limit}`, {
      signal: AbortSignal.timeout(3500),
    });
    if (hnRes.ok) {
      const data = await hnRes.json();
      for (const h of data.hits || []) {
        if (h.title && (h.url || h.objectID)) {
          results.push({
            title: h.title,
            url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            snippet: `${h.points ? `${h.points} points · ` : ""}${h.num_comments ? `${h.num_comments} comments · ` : ""}${new Date(h.created_at).toLocaleDateString()}`,
          });
          if (results.length >= limit) break;
        }
      }
    }
  } catch {}

  // 2. Fetch from Wikipedia OpenSearch (encyclopedic topics, companies, definitions)
  if (results.length < limit) {
    try {
      const wikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=${limit}&namespace=0&format=json`,
        { signal: AbortSignal.timeout(3500) }
      );
      if (wikiRes.ok) {
        const [, titles, descriptions, urls] = (await wikiRes.json()) as [string, string[], string[], string[]];
        for (let i = 0; i < titles.length; i++) {
          if (titles[i] && urls[i]) {
            results.push({
              title: titles[i],
              url: urls[i],
              snippet: descriptions[i] || "Wikipedia reference article.",
            });
            if (results.length >= limit) break;
          }
        }
      }
    } catch {}
  }

  if (results.length === 0) {
    return `No quick search results found for "${q}". Use open_url and read_page to browse relevant sites directly.`;
  }

  return results
    .map((r, i) => `${i + 1}. [${r.title}](${r.url})\n   ${r.snippet || "No description available."}`)
    .join("\n\n");
}

