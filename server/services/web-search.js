// Web Search Service — simulated in demo mode, can connect to SerpAPI / Google Custom Search
// Returns structured search results with title, snippet, URL, and date

const DEMO_RESULTS = {
  programming: [
    { title: 'MDN Web Docs — JavaScript Reference', snippet: 'Comprehensive JavaScript documentation with examples, tutorials, and API references for web developers.', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', date: '2024' },
    { title: 'Stack Overflow — Developer Community', snippet: 'The largest online community for developers to learn, share knowledge, and build careers.', url: 'https://stackoverflow.com', date: '2024' },
    { title: 'GitHub — Where Software is Built', snippet: 'GitHub is the world\'s largest code hosting platform with over 100 million repositories.', url: 'https://github.com', date: '2024' },
  ],
  ai: [
    { title: 'Google AI — Gemini Models', snippet: 'Gemini is Google\'s most capable AI model, built for multimodal understanding across text, code, images, and more.', url: 'https://ai.google.dev', date: '2024' },
    { title: 'OpenAI Platform — GPT-4 and Beyond', snippet: 'Build intelligent applications with GPT-4, DALL-E, and other powerful AI models through OpenAI\'s API.', url: 'https://platform.openai.com', date: '2024' },
    { title: 'Hugging Face — AI Community Hub', snippet: 'The platform for sharing and deploying machine learning models, datasets, and applications.', url: 'https://huggingface.co', date: '2024' },
  ],
  general: [
    { title: 'Wikipedia — The Free Encyclopedia', snippet: 'Wikipedia is a free online encyclopedia with millions of articles contributed by volunteers worldwide.', url: 'https://en.wikipedia.org', date: '2024' },
    { title: 'Reuters — Breaking News & Analysis', snippet: 'Reuters provides trusted business, financial, national, and international news and analysis.', url: 'https://www.reuters.com', date: '2024' },
    { title: 'Khan Academy — Free Online Education', snippet: 'Learn anything for free with thousands of courses in math, science, computing, and more.', url: 'https://www.khanacademy.org', date: '2024' },
  ],
  react: [
    { title: 'React Documentation — Official Guide', snippet: 'The library for web and native user interfaces. Build encapsulated components that manage their own state.', url: 'https://react.dev', date: '2024' },
    { title: 'React Router — Declarative Routing', snippet: 'Declarative routing for React applications. Full featured client and server-side routing framework.', url: 'https://reactrouter.com', date: '2024' },
    { title: 'TanStack Query — Data Fetching for React', snippet: 'Powerful asynchronous state management, server-state utilities, and data fetching for React.', url: 'https://tanstack.com/query', date: '2024' },
  ]
};

function categorizeQuery(query) {
  const lower = query.toLowerCase();
  if (lower.includes('react') || lower.includes('vue') || lower.includes('angular') || lower.includes('next')) return 'react';
  if (lower.includes('code') || lower.includes('programming') || lower.includes('javascript') || lower.includes('python')) return 'programming';
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('gpt') || lower.includes('gemini') || lower.includes('llm')) return 'ai';
  return 'general';
}

export async function searchWeb(query) {
  // In production: Use SerpAPI, Google Custom Search, or Brave Search API
  // const SERP_API_KEY = process.env.SERP_API_KEY;
  // if (SERP_API_KEY) {
  //   const resp = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}`);
  //   const data = await resp.json();
  //   return data.organic_results.map(r => ({ title: r.title, snippet: r.snippet, url: r.link, date: r.date }));
  // }

  // Demo mode: return categorized mock results
  const category = categorizeQuery(query);
  const results = DEMO_RESULTS[category] || DEMO_RESULTS.general;

  return {
    query,
    results: results.map(r => ({
      ...r,
      relevanceScore: (Math.random() * 0.3 + 0.7).toFixed(2)
    })),
    totalResults: Math.floor(Math.random() * 50000) + 10000,
    searchTime: (Math.random() * 0.5 + 0.1).toFixed(2) + 's'
  };
}

export function formatSearchResultsForAI(searchData) {
  const { query, results } = searchData;
  let formatted = `Web search results for "${query}":\n\n`;
  results.forEach((r, i) => {
    formatted += `[${i + 1}] **${r.title}**\n${r.snippet}\nSource: ${r.url}\n\n`;
  });
  return formatted;
}
