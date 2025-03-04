export interface User {
  username: string;
  isAdmin: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Thread {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceOptions {
  enabled: boolean;
  language: 'el' | 'en';
  volume: number;
  rate: number;
  pitch: number;
  useEnhancedVoices?: boolean;
  voiceId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'el' | 'en';
  voice: VoiceOptions;
}

export interface LeadGenerationRequest {
  industry: string;
  location: string;
  criteria?: string[];
}

export interface InvoiceCreationRequest {
  customer: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  notes?: string;
}

export interface ProductQuery {
  category?: string;
  inStock?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export type AssistantPurpose = 
  | 'lead_generation'
  | 'invoice_creation'
  | 'product_info'
  | 'general_query';

export interface Lead {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  assignedTo?: string;
} 