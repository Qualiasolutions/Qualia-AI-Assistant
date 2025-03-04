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
        return parsed.map((lead: any) => ({
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
    
    // Otherwise, return all leads
    return NextResponse.json({ leads: leadsStore });
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
      status: 'new',
      assignedTo: data.assignedTo || undefined,
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