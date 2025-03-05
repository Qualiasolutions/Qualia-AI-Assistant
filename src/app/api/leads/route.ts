import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/types';

// In-memory store as a fallback
let leadsStore: Lead[] = [];

// Helper function to load leads from localStorage (client-side only)
const loadLeadsFromStorage = (): Lead[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedLeads = localStorage.getItem('tzironis_leads');
      if (storedLeads) {
        // Parse dates back to Date objects
        const parsed = JSON.parse(storedLeads);
        return parsed.map((lead: Omit<Lead, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }) => ({
          ...lead,
          createdAt: new Date(lead.createdAt),
          updatedAt: new Date(lead.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading leads from storage:', error);
    }
  }
  return [];
};

// Helper function to save leads to localStorage (client-side only)
const saveLeadsToStorage = (leads: Lead[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tzironis_leads', JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving leads to storage:', error);
    }
  }
};

// Initialize leads store from localStorage if available
try {
  const initialLeads = loadLeadsFromStorage();
  if (initialLeads.length > 0) {
    leadsStore = initialLeads;
  }
} catch (error) {
  console.error('Error initializing leads store:', error);
}

// Sort leads based on query parameters
const sortLeads = (leads: Lead[], sortBy: string, sortOrder: 'asc' | 'desc'): Lead[] => {
  return [...leads].sort((a, b) => {
    let valueA: string | number = '';
    let valueB: string | number = '';
    
    // Handle different sort fields
    switch (sortBy) {
      case 'companyName':
        valueA = a.companyName.toLowerCase();
        valueB = b.companyName.toLowerCase();
        break;
      case 'industry':
        valueA = a.industry.toLowerCase();
        valueB = b.industry.toLowerCase();
        break;
      case 'status':
        valueA = a.status.toLowerCase();
        valueB = b.status.toLowerCase();
        break;
      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
        break;
      default:
        // Default sort by updatedAt
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
    }
    
    // Apply sort order
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
};

// Filter leads based on query parameters
const filterLeads = (leads: Lead[], filters: Record<string, string>): Lead[] => {
  return leads.filter(lead => {
    // Check each filter
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      
      const filterValue = value.toLowerCase();
      
      switch (key) {
        case 'search':
          // Search across multiple fields
          const searchFields = [
            lead.companyName,
            lead.industry,
            lead.location,
            lead.contactPerson || '',
            lead.email || '',
            lead.phone || '',
            lead.notes || ''
          ].map(field => field.toLowerCase());
          
          // If any field contains the search term, include this lead
          if (!searchFields.some(field => field.includes(filterValue))) {
            return false;
          }
          break;
        case 'status':
          if (lead.status.toLowerCase() !== filterValue) {
            return false;
          }
          break;
        case 'industry':
          if (!lead.industry.toLowerCase().includes(filterValue)) {
            return false;
          }
          break;
        case 'location':
          if (!lead.location.toLowerCase().includes(filterValue)) {
            return false;
          }
          break;
        case 'assignedTo':
          if (!lead.assignedTo || !lead.assignedTo.toLowerCase().includes(filterValue)) {
            return false;
          }
          break;
      }
    }
    
    return true;
  });
};

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    // If ID is provided, return a specific lead
    if (id) {
      const lead = leadsStore.find(lead => lead.id === id);
      
      if (!lead) {
        return NextResponse.json(
          { message: 'Lead not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ lead });
    }
    
    // Extract filter parameters
    const filters: Record<string, string> = {};
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const assignedTo = searchParams.get('assignedTo');
    
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (industry) filters.industry = industry;
    if (location) filters.location = location;
    if (assignedTo) filters.assignedTo = assignedTo;
    
    // Extract sort parameters
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Extract pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    // Apply filters
    let filteredLeads = filterLeads(leadsStore, filters);
    
    // Get total count before pagination
    const totalCount = filteredLeads.length;
    
    // Apply sorting
    filteredLeads = sortLeads(filteredLeads, sortBy, sortOrder);
    
    // Apply pagination
    const paginatedLeads = filteredLeads.slice(skip, skip + limit);
    
    // Return leads with pagination metadata
    return NextResponse.json({
      leads: paginatedLeads,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    return NextResponse.json(
      { message: 'An error occurred while retrieving leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.companyName || !data.industry || !data.location || !data.source) {
      return NextResponse.json(
        { message: 'Company name, industry, location, and source are required' },
        { status: 400 }
      );
    }
    
    // Create new lead
    const newLead: Lead = {
      id: uuidv4(),
      companyName: data.companyName,
      industry: data.industry,
      location: data.location,
      contactPerson: data.contactPerson || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
      notes: data.notes || undefined,
      source: data.source,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: data.status || 'new',
      assignedTo: data.assignedTo || undefined,
      tags: data.tags || [],
      lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : undefined,
      estimatedValue: data.estimatedValue || undefined,
      priority: data.priority || 'medium'
    };
    
    // Add to store
    leadsStore.push(newLead);
    
    // Persist to localStorage
    saveLeadsToStorage(leadsStore);
    
    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating lead' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate ID
    if (!data.id) {
      return NextResponse.json(
        { message: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    // Find lead
    const leadIndex = leadsStore.findIndex(lead => lead.id === data.id);
    
    if (leadIndex === -1) {
      return NextResponse.json(
        { message: 'Lead not found' },
        { status: 404 }
      );
    }
    
    // Update lead
    const updatedLead: Lead = {
      ...leadsStore[leadIndex],
      ...data,
      updatedAt: new Date(),
      // Convert date strings to Date objects
      createdAt: leadsStore[leadIndex].createdAt,
      lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : leadsStore[leadIndex].lastContactDate
    };
    
    // Replace in store
    leadsStore[leadIndex] = updatedLead;
    
    // Persist to localStorage
    saveLeadsToStorage(leadsStore);
    
    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    // Find lead
    const leadIndex = leadsStore.findIndex(lead => lead.id === id);
    
    if (leadIndex === -1) {
      return NextResponse.json(
        { message: 'Lead not found' },
        { status: 404 }
      );
    }
    
    // Remove from store
    leadsStore.splice(leadIndex, 1);
    
    // Persist to localStorage
    saveLeadsToStorage(leadsStore);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting lead' },
      { status: 500 }
    );
  }
} 