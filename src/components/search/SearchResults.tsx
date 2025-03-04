import React from 'react';
import { FiExternalLink, FiSearch, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  formattedUrl?: string;
  pagemap?: Record<string, any>;
}

interface SearchMetadata {
  totalResults: number;
  searchTime: number;
  hasNextPage: boolean;
  searchTerms: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  query: string;
  onClose: () => void;
  onInsert?: (result: SearchResult) => void;
  metadata?: SearchMetadata | null;
}

export default function SearchResults({
  results,
  isSearching,
  error,
  query,
  onClose,
  onInsert,
  metadata
}: SearchResultsProps) {
  if (!query && !isSearching && results.length === 0) {
    return null;
  }

  // Function to safely render HTML content
  const createMarkup = (html: string) => {
    return {__html: html};
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-t-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden w-full max-w-2xl"
    >
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
      
      <div className="max-h-96 overflow-y-auto p-4">
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
            <p>No results found for &quot;{query}&quot;</p>
            <p className="text-sm mt-2">Please try different search terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div 
                key={`${result.link}-${index}`} 
                className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-blue-600 dark:text-blue-400">
                    {result.htmlTitle ? (
                      <span dangerouslySetInnerHTML={createMarkup(result.htmlTitle)} />
                    ) : (
                      result.title
                    )}
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
                  {result.htmlSnippet ? (
                    <span dangerouslySetInnerHTML={createMarkup(result.htmlSnippet)} />
                  ) : (
                    result.snippet
                  )}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {result.formattedUrl || result.link}
                </div>
                
                {/* Show image thumbnails if available in pagemap */}
                {result.pagemap?.cse_thumbnail && (
                  <div className="mt-2">
                    <img 
                      src={result.pagemap.cse_thumbnail[0].src} 
                      alt={`Thumbnail for ${result.title}`}
                      className="rounded h-16 border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 