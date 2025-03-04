import React, { useState } from 'react';
import { FiUsers, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import useLeads from '@/hooks/useLeads';
import { Lead } from '@/types';

type ExpandableSectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function ExpandableSection({ title, icon, children }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      
      {expanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}

function LeadItem({ lead }: { lead: Lead }) {
  return (
    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
      <p className="font-medium">{lead.companyName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{lead.industry} • {lead.location}</p>
      <p className="text-xs mt-1">
        Status: <span className={`${
          lead.status === 'new' ? 'text-amber-600 dark:text-amber-400' : 
          lead.status === 'contacted' ? 'text-blue-600 dark:text-blue-400' :
          lead.status === 'qualified' ? 'text-green-600 dark:text-green-400' :
          lead.status === 'converted' ? 'text-purple-600 dark:text-purple-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
        </span>
      </p>
    </div>
  );
}

export default function DataSidebar() {
  const { leads, isLoading, error } = useLeads();
  
  return (
    <div className="flex flex-col p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Business Data</h2>
      
      <ExpandableSection 
        title="Recent Leads" 
        icon={<FiUsers className="text-blue-500" />}
      >
        {isLoading ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">Loading leads...</p>
          </div>
        ) : error ? (
          <div className="text-center py-2">
            <p className="text-sm text-red-500">Error loading leads</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">No leads found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try asking the assistant to generate leads for your business
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.slice(0, 5).map(lead => (
              <LeadItem key={lead.id} lead={lead} />
            ))}
            
            {leads.length > 5 && (
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">
                View all leads ({leads.length}) →
              </button>
            )}
          </div>
        )}
      </ExpandableSection>
    </div>
  );
} 