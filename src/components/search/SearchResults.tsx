import React from 'react';
import { FiExternalLink, FiSearch, FiX } from 'react-icons/fi';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  query: string;
  onClose: () => void;
  onInsert?: (result: SearchResult) => void;
}

export default function SearchResults({
  results,
  isSearching,
  error,
  query,
  onClose,
  onInsert
}: SearchResultsProps) {
  if (!query && !isSearching && results.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden w-full max-w-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center">
          <FiSearch className="text-gray-500 dark:text-gray-400 mr-2" />
          <span className="font-medium">
            {isSearching ? 'Searching...' : `Results for: ${query}`}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Close search results"
        >
          <FiX />
        </button>
      </div>
      
      <div className="p-4">
        {isSearching ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <p>{error}</p>
            <p className="text-sm mt-2">Please try again with different search terms.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No results found for "{query}"</p>
            <p className="text-sm mt-2">Please try different search terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={`${result.link}-${index}`} 
                className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-blue-600 dark:text-blue-400">
                    {result.title}
                  </h3>
                  <div className="flex space-x-2">
                    {onInsert && (
                      <button
                        onClick={() => onInsert(result)}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                      >
                        Use This
                      </button>
                    )}
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <FiExternalLink size={16} />
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {result.snippet}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {result.link}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 