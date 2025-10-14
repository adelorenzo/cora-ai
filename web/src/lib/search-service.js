export class SearchService {
  async searchWeb(query) {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );

      const data = await response.json();

      const results = [];

      if (data.AbstractText) {
        results.push({
          title: data.Heading || 'Summary',
          snippet: data.AbstractText,
          url: data.AbstractURL || '',
          source: data.AbstractSource || 'DuckDuckGo'
        });
      }

      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 5).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0],
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'DuckDuckGo'
            });
          }
        });
      }

      return {
        success: true,
        results: results,
        query: query
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        query: query
      };
    }
  }
}

export const searchService = new SearchService();
