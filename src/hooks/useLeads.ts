import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/types';

export default function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // First try to load leads from localStorage directly for better UX
  useEffect(() => {
    const loadLeadsFromLocalStorage = () => {
      try {
        const storedLeads = localStorage.getItem('tzironis_leads');
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          const parsedLeads = parsed.map((lead: any) => ({
            ...lead,
            createdAt: new Date(lead.createdAt),
            updatedAt: new Date(lead.updatedAt)
          }));
          setLeads(parsedLeads);
          setIsLoading(false);
        } else {
          // If no leads in local storage, fetch from API
          fetchLeads();
        }
      } catch (error) {
        console.error('Error loading leads from localStorage:', error);
        // Fall back to API
        fetchLeads();
      }
    };

    loadLeadsFromLocalStorage();
  }, []);

  // Fetch all leads from the API
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new lead
  const createLead = useCallback(async (leadData: Partial<Lead>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create lead');
      }
      
      const data = await response.json();
      setLeads(prevLeads => [...prevLeads, data.lead]);
      return data.lead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Parse messages for potential leads and extract them
  const extractLeadsFromMessage = useCallback((content: string): Partial<Lead>[] => {
    const leads: Partial<Lead>[] = [];
    
    // Try to detect structured lead information in various formats
    // Pattern 1: Headers with Company/Business name, Industry, Location
    const leadRegex1 = /(?:company|business)(?:\sname)?:?\s*([^,\n]+).*?industry:?\s*([^,\n]+).*?location:?\s*([^,\n]+)/gi;
    
    // Pattern 2: Information presented in a list format
    const leadRegex2 = /(?:name|business|company):\s*([^\n]+)\s*(?:industry|sector|field):\s*([^\n]+)\s*(?:location|city|area|region):\s*([^\n]+)/gi;
    
    // Try both patterns
    [leadRegex1, leadRegex2].forEach(regex => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const companyName = match[1].trim();
        const industry = match[2].trim();
        const location = match[3].trim();
        
        // Check if we already added this company (avoid duplicates)
        const isDuplicate = leads.some(lead => 
          lead.companyName?.toLowerCase() === companyName.toLowerCase() &&
          lead.industry?.toLowerCase() === industry.toLowerCase() &&
          lead.location?.toLowerCase() === location.toLowerCase()
        );
        
        if (!isDuplicate && companyName && industry && location) {
          leads.push({
            companyName,
            industry,
            location,
            source: 'AI Assistant',
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    });
    
    // Look for contact information that might be associated with the leads
    if (leads.length > 0) {
      // Try to extract emails, phones and websites
      const emailRegex = /email:?\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
      const phoneRegex = /(?:phone|tel|telephone):?\s*((?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4})/gi;
      const websiteRegex = /(?:website|site|web|url):?\s*(?:https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/[-a-zA-Z0-9%_.~#?&=]*)?)/gi;
      
      let emailMatch, phoneMatch, websiteMatch;
      
      if ((emailMatch = emailRegex.exec(content)) !== null && leads[0]) {
        leads[0].email = emailMatch[1].trim();
      }
      
      if ((phoneMatch = phoneRegex.exec(content)) !== null && leads[0]) {
        leads[0].phone = phoneMatch[1].trim();
      }
      
      if ((websiteMatch = websiteRegex.exec(content)) !== null && leads[0]) {
        leads[0].website = websiteMatch[1].trim();
      }
    }
    
    return leads;
  }, []);

  return {
    leads,
    isLoading,
    error,
    fetchLeads,
    createLead,
    extractLeadsFromMessage
  };
} 