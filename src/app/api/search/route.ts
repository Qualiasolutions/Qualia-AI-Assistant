import { NextRequest, NextResponse } from 'next/server';

// Search results interface
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  formattedUrl?: string;
  pagemap?: Record<string, unknown>;
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

export async function POST(request: NextRequest) {
  try {
    const { query, num = 10, start = 1, lr = '', safe = 'off' } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variable
    const apiKey = process.env.SEARCH_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      // Fallback to a simplified mock response if API keys are not available
      return NextResponse.json({
        results: getFallbackResults(query)
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
    const results: SearchResult[] = data.items?.map((item: GoogleSearchItem) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || '',
      htmlTitle: item.htmlTitle,
      htmlSnippet: item.htmlSnippet,
      formattedUrl: item.formattedUrl,
      pagemap: item.pagemap
    })) || [];
    
    // Return structured data including search metadata
    return NextResponse.json({
      results,
      searchInformation: data.searchInformation,
      hasNextPage: !!data.queries?.nextPage,
      totalResults: parseInt(data.searchInformation?.totalResults || '0', 10),
      searchTime: data.searchInformation?.searchTime || 0,
      searchTerms: data.queries?.request?.[0]?.searchTerms || query
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
function getFallbackResults(query: string): SearchResult[] {
  // Provide a simple fallback response based on the query
  return [
    {
      title: `Search results for: ${query}`,
      link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `This is a fallback response. Please configure SEARCH_API_KEY and SEARCH_ENGINE_ID environment variables to enable real search functionality.`
    }
  ];
} 