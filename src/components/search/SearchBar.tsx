import React, { useState, useRef, KeyboardEvent } from 'react';
import { FiSearch, FiX, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import useSearch from '@/hooks/useSearch';
import SearchResults from './SearchResults';
import { motion } from 'framer-motion';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  formattedUrl?: string;
}

interface SearchBarProps {
  onSearchComplete?: (searchText: string, searchResults: string) => void;
}

export default function SearchBar({ onSearchComplete }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, results, metadata, isSearching, error, lastQuery } = useSearch();

  const handleSearch = async (page = 1) => {
    if (!query.trim()) return;
    
    setCurrentPage(page);
    const searchResults = await search(query, { 
      start: ((page - 1) * 10) + 1, // Google search uses 1-based indexing
      num: 10
    });
    
    setShowResults(true);
    
    // If a callback is provided, format and return search results
    if (onSearchComplete && searchResults.length > 0) {
      const formattedResults = formatSearchResults(searchResults);
      onSearchComplete(query, formattedResults);
    }
  };

  const formatSearchResults = (results: SearchResult[]): string => {
    return results.map((result, index) => {
      return `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.link}\n`;
    }).join('\n');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(1); // Reset to first page on new search
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleInsert = (result: SearchResult) => {
    if (onSearchComplete) {
      const formattedResult = `${result.title}\n${result.snippet}\nSource: ${result.link}`;
      onSearchComplete(query, formattedResult);
      setShowResults(false);
      setQuery('');
    }
  };

  const handleClose = () => {
    setShowResults(false);
  };
  
  const handleNextPage = () => {
    if (metadata?.hasNextPage) {
      handleSearch(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handleSearch(currentPage - 1);
    }
  };

  return (
    <div className="relative w-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiSearch className="text-gray-500 dark:text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 pl-10 pr-10 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          placeholder="Search the web..."
          aria-label="Search the web"
        />
        {query && (
          <button 
            onClick={() => setQuery('')} 
            className="absolute inset-y-0 right-12 flex items-center pr-1"
          >
            <FiX className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
        )}
        <button
          onClick={() => handleSearch(1)}
          disabled={!query.trim() || isSearching}
          className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
            !query.trim() || isSearching 
              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
          }`}
        >
          {isSearching ? (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          ) : (
            <span className="text-xs font-medium">Search</span>
          )}
        </button>
      </motion.div>
      
      {showResults && (
        <div className="absolute top-12 left-0 right-0 z-50">
          <SearchResults
            results={results}
            isSearching={isSearching}
            error={error}
            query={lastQuery}
            onClose={handleClose}
            onInsert={handleInsert}
            metadata={metadata}
          />
          
          {/* Pagination controls */}
          {results.length > 0 && metadata && (
            <div className="bg-white dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg p-2 flex justify-between items-center text-xs shadow-lg">
              <div className="text-gray-500 dark:text-gray-400">
                About {metadata.totalResults.toLocaleString()} results ({metadata.searchTime.toFixed(2)} seconds)
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className={`p-1 rounded ${
                    currentPage <= 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiChevronLeft />
                </button>
                
                <span className="text-gray-700 dark:text-gray-300">Page {currentPage}</span>
                
                <button
                  onClick={handleNextPage}
                  disabled={!metadata.hasNextPage}
                  className={`p-1 rounded ${
                    !metadata.hasNextPage 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 