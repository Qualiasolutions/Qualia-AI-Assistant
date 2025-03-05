export interface User {
  readonly username: string;
  readonly isAdmin: boolean;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;
}

export interface Thread {
  readonly id: string;
  readonly messages: readonly Message[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type VoiceLanguage = 'el' | 'en';

export interface VoiceOptions {
  enabled: boolean;
  language: VoiceLanguage;
  volume: number; // 0 to 1
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  useEnhancedVoices?: boolean;
  voiceId?: string;
  greekVoice?: {
    voiceId: string;
  };
  englishVoice?: {
    voiceId: string;
  };
}

export type ThemeOption = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeOption;
  language: VoiceLanguage;
  voice: VoiceOptions;
}

export interface LeadGenerationRequest {
  industry: string;
  location: string;
  criteria?: readonly string[];
}

export interface InvoiceItem {
  readonly name: string;
  readonly quantity: number;
  readonly price: number;
}

export interface InvoiceCreationRequest {
  readonly customer: string;
  readonly items: readonly InvoiceItem[];
  readonly notes?: string;
}

export interface PriceRange {
  readonly min?: number;
  readonly max?: number;
}

export interface ProductQuery {
  readonly category?: string;
  readonly inStock?: boolean;
  readonly priceRange?: PriceRange;
}

export type AssistantPurpose = 
  | 'lead_generation'
  | 'invoice_creation'
  | 'product_info'
  | 'general_query';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
export type LeadPriority = 'low' | 'medium' | 'high';

export interface Lead {
  readonly id: string;
  readonly companyName: string;
  readonly industry: string;
  readonly location: string;
  readonly contactPerson?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly website?: string;
  readonly notes?: string;
  readonly source: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly status: LeadStatus;
  readonly assignedTo?: string;
  readonly tags?: string[];
  readonly lastContactDate?: Date;
  readonly estimatedValue?: number;
  readonly priority?: LeadPriority;
}

export interface ApiResponse<T> {
  readonly data?: T;
  readonly error?: string;
  readonly status: number;
}

export interface ApiErrorResponse {
  readonly message: string;
  readonly code?: string;
  readonly status: number;
}

export interface AuthResponse {
  readonly user: User;
  readonly token: string;
}

export interface SearchResult {
  readonly title: string;
  readonly link: string;
  readonly snippet: string;
} 