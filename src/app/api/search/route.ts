import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { SearchResult } from '@/types';

// Search results interface with extended properties
interface EnhancedSearchResult extends SearchResult {
  htmlTitle?: string;
  htmlSnippet?: string;
  formattedUrl?: string;
  pagemap?: Record<string, unknown>;
  domain?: string;
  favicon?: string;
}

// Google search API response structure
interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  queries?: {
    request?: Array<{
      totalResults: string;
      searchTerms: string;
    }>;
    nextPage?: Array<Record<string, unknown>>;
  };
  error?: {
    code: number;
    message: string;
  };
}

// Google search API response item structure
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet?: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  formattedUrl?: string;
  pagemap?: Record<string, unknown>;
  // Use unknown instead of any for better type safety
  [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
}

// Cache for search results to reduce API calls
interface CacheEntry {
  results: EnhancedSearchResult[];
  metadata: {
    totalResults: number;
    searchTime: number;
    hasNextPage: boolean;
    searchTerms: string;
  };
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const CACHE_MAX_SIZE = 20;

/**
 * Manage cache size by removing the oldest entries when the max size is reached
 */
function manageCacheSize(): void {
  if (searchCache.size >= CACHE_MAX_SIZE) {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    // Find the oldest entry
    for (const [key, data] of searchCache.entries()) {
      if (data.timestamp < oldestTime) {
        oldestTime = data.timestamp;
        oldestKey = key;
      }
    }
    
    // Remove the oldest entry
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    return '';
  }
}

/**
 * Get favicon URL for a domain
 */
function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

/**
 * Scrape additional content from a URL
 */
async function scrapeAdditionalContent(url: string): Promise<{ title?: string; description?: string; content?: string }> {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    
    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : undefined;
    
    // Extract meta description
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i);
    const description = descriptionMatch ? descriptionMatch[1] : undefined;
    
    // Extract main content (simplified)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : undefined;
    
    // Clean up content (remove scripts, styles, etc.)
    if (content) {
      content = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Limit content length
      content = content.length > 1000 ? content.substring(0, 1000) + '...' : content;
    }
    
    return { title, description, content };
  } catch (fetchError) {
    console.error(`Error scraping ${url}:`, fetchError);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, num = 10, start = 1, lr = '', safe = 'off', scrape = false } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `${query}_${num}_${start}_${lr}_${safe}_${scrape}`;
    
    // Check cache
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey)!;
      const now = Date.now();
      
      // Return cached data if it's fresh
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log('Using cached search results');
        return NextResponse.json({
          results: cachedData.results,
          ...cachedData.metadata,
          fromCache: true
        });
      }
    }

    // Get API key from environment variable
    const apiKey = process.env.SEARCH_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      // Fallback to a simplified mock response if API keys are not available
      const mockResults = getFallbackResults(query);
      
      // Cache the mock results
      manageCacheSize();
      searchCache.set(cacheKey, {
        results: mockResults,
        metadata: {
          totalResults: mockResults.length,
          searchTime: 0.1,
          hasNextPage: false,
          searchTerms: query
        },
        timestamp: Date.now()
      });
      
      return NextResponse.json({
        results: mockResults,
        totalResults: mockResults.length,
        searchTime: 0.1,
        hasNextPage: false,
        searchTerms: query,
        isMock: true
      });
    }

    // Build the search URL with additional parameters for optimization
    // Using fields parameter for partial response to improve performance
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', apiKey);
    searchUrl.searchParams.append('cx', searchEngineId);
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('num', num.toString()); // Number of results (1-10)
    searchUrl.searchParams.append('start', start.toString()); // Pagination start index
    
    // Only add language restriction if specified
    if (lr) {
      searchUrl.searchParams.append('lr', lr); // Language restriction
    }
    
    searchUrl.searchParams.append('safe', safe); // Safe search setting
    
    // Request only fields we need for performance optimization
    searchUrl.searchParams.append('fields', 'items(title,link,snippet,htmlTitle,htmlSnippet,formattedUrl,pagemap),queries,searchInformation');
    
    // Perform the actual search using Google Custom Search API with proper headers
    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept-Encoding': 'gzip',
        'User-Agent': 'Qualia-AI-Assistant (gzip)'
      }
    });
    
    const data: GoogleSearchResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to perform search');
    }
    
    // Extract and format search results
    let results: EnhancedSearchResult[] = data.items?.map((item: GoogleSearchItem) => {
      const domain = extractDomain(item.link);
      
      return {
        title: item.title,
        link: item.link,
        snippet: item.snippet || '',
        htmlTitle: item.htmlTitle,
        htmlSnippet: item.htmlSnippet,
        formattedUrl: item.formattedUrl,
        pagemap: item.pagemap,
        domain,
        favicon: getFaviconUrl(domain)
      };
    }) || [];
    
    // Scrape additional content if requested
    if (scrape && results.length > 0) {
      // Only scrape the first 3 results to avoid overloading
      const scrapeLimit = Math.min(3, results.length);
      
      // Scrape in parallel
      const scrapePromises = results.slice(0, scrapeLimit).map(async (result, index) => {
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, index * 500));
        
        const additionalContent = await scrapeAdditionalContent(result.link);
        
        return {
          ...result,
          scrapedTitle: additionalContent.title,
          scrapedDescription: additionalContent.description,
          scrapedContent: additionalContent.content
        };
      });
      
      // Wait for all scraping to complete
      const scrapedResults = await Promise.all(scrapePromises);
      
      // Replace the first few results with scraped versions
      results = [
        ...scrapedResults,
        ...results.slice(scrapeLimit)
      ];
    }
    
    // Prepare metadata
    const metadata = {
      totalResults: parseInt(data.searchInformation?.totalResults || '0', 10),
      searchTime: data.searchInformation?.searchTime || 0,
      hasNextPage: !!data.queries?.nextPage,
      searchTerms: data.queries?.request?.[0]?.searchTerms || query
    };
    
    // Cache the results
    manageCacheSize();
    searchCache.set(cacheKey, {
      results,
      metadata,
      timestamp: Date.now()
    });
    
    // Return structured data including search metadata
    return NextResponse.json({
      results,
      ...metadata
    });
    
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { message: 'An error occurred while searching', error: String(error) },
      { status: 500 }
    );
  }
}

// Fallback function to provide limited results when API keys are not available
function getFallbackResults(query: string): EnhancedSearchResult[] {
  // Provide a simple fallback response based on the query
  return [
    {
      title: `Search results for: ${query}`,
      link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `This is a fallback response. Please configure SEARCH_API_KEY and SEARCH_ENGINE_ID environment variables to enable real search functionality.`,
      domain: 'google.com',
      favicon: getFaviconUrl('google.com')
    },
    {
      title: 'Configure Google Custom Search',
      link: 'https://programmablesearchengine.google.com/about/',
      snippet: 'Learn how to set up Google Custom Search for your application.',
      domain: 'programmablesearchengine.google.com',
      favicon: getFaviconUrl('programmablesearchengine.google.com')
    }
  ];
} 