import { useState, useCallback } from 'react';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export default function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    try {
      setIsSearching(true);
      setError(null);
      setLastQuery(query);
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to perform search');
      }
      
      const data = await response.json();
      setResults(data.results || []);
      return data.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform search';
      setError(errorMessage);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    search,
    results,
    isSearching,
    error,
    lastQuery
  };
} 