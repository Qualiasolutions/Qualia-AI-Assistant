import React, { useState, useRef, KeyboardEvent } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import useSearch from '@/hooks/useSearch';
import SearchResults from './SearchResults';

interface SearchBarProps {
  onSearchComplete?: (searchText: string, searchResults: string) => void;
}

export default function SearchBar({ onSearchComplete }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, results, isSearching, error, lastQuery } = useSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const searchResults = await search(query);
    setShowResults(true);
    
    // If a callback is provided, format and return search results
    if (onSearchComplete && searchResults.length > 0) {
      const formattedResults = formatSearchResults(searchResults);
      onSearchComplete(query, formattedResults);
    }
  };

  const formatSearchResults = (results: any[]): string => {
    return results.map((result, index) => {
      return `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.link}\n`;
    }).join('\n');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleInsert = (result: any) => {
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

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiSearch className="text-gray-500 dark:text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 pl-10 pr-10 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
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
          onClick={handleSearch}
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
      </div>
      
      {showResults && (
        <div className="absolute top-12 left-0 right-0 z-50">
          <SearchResults
            results={results}
            isSearching={isSearching}
            error={error}
            query={lastQuery}
            onClose={handleClose}
            onInsert={handleInsert}
          />
        </div>
      )}
    </div>
  );
} 