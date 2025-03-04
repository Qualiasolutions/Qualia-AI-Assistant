import { NextRequest, NextResponse } from 'next/server';

// Search results interface
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

// Google search API response item structure
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet?: string;
  [key: string]: any; // Allow other properties without strict typing
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
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

    // Perform the actual search using Google Custom Search API
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to perform search');
    }
    
    // Extract and format search results
    const results: SearchResult[] = data.items?.map((item: GoogleSearchItem) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || ''
    })) || [];
    
    return NextResponse.json({ results });
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