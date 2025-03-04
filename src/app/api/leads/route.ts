import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/types';

// In a real application, this would be a database connection
// For demo purposes, we'll use localStorage on the client and this in-memory store on the server
const leadsStore: Lead[] = [];

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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting lead' },
      { status: 500 }
    );
  }
} 