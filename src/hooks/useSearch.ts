import { useState, useCallback } from 'react';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  formattedUrl?: string;
  pagemap?: Record<string, unknown>;
}

interface SearchMetadata {
  totalResults: number;
  searchTime: number;
  hasNextPage: boolean;
  searchTerms: string;
}

interface SearchOptions {
  num?: number;
  start?: number;
  lr?: string;
  safe?: 'off' | 'medium' | 'high';
}

export default function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  const search = useCallback(async (query: string, options: SearchOptions = {}): Promise<SearchResult[]> => {
    try {
      setIsSearching(true);
      setError(null);
      setLastQuery(query);
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          ...options
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to perform search');
      }
      
      const data = await response.json();
      setResults(data.results || []);
      
      // Set metadata if available
      if (data.totalResults !== undefined) {
        setMetadata({
          totalResults: data.totalResults,
          searchTime: data.searchTime || 0,
          hasNextPage: data.hasNextPage || false,
          searchTerms: data.searchTerms || query
        });
      }
      
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
    metadata,
    isSearching,
    error,
    lastQuery
  };
} 