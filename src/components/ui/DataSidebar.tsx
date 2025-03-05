import React, { useState, useEffect } from 'react';
import { FiUsers, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import useLeads from '@/hooks/useLeads';
import { Lead } from '@/types';

type ExpandableSectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  initialExpanded?: boolean;
  count?: number;
};

function ExpandableSection({ title, icon, children, initialExpanded = false, count }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  return (
    <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium">{title}</span>
          {count !== undefined && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
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
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 mb-3">
      <p className="font-medium text-gray-800 dark:text-gray-200">{lead.companyName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lead.industry} • {lead.location}</p>
      
      {(lead.email || lead.phone || lead.website) && (
        <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800/30">
          {lead.email && <p className="text-xs text-gray-600 dark:text-gray-300 truncate">Email: {lead.email}</p>}
          {lead.phone && <p className="text-xs text-gray-600 dark:text-gray-300 truncate">Phone: {lead.phone}</p>}
          {lead.website && <p className="text-xs text-gray-600 dark:text-gray-300 truncate">Web: {lead.website}</p>}
        </div>
      )}
      
      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs">
          <span className={`px-2 py-0.5 rounded-full ${
            lead.status === 'new' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 
            lead.status === 'contacted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
            lead.status === 'qualified' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
            lead.status === 'converted' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(lead.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default function DataSidebar() {
  const { leads, isLoading, error, fetchLeads } = useLeads();
  const [autoExpand, setAutoExpand] = useState(false);
  
  // Auto-expand when new leads are added
  useEffect(() => {
    if (leads.length > 0 && !autoExpand) {
      setAutoExpand(true);
    }
  }, [leads.length, autoExpand]);
  
  // Refresh leads every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchLeads();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchLeads]);
  
  const handleRefresh = () => {
    fetchLeads();
  };
  
  return (
    <div className="flex flex-col p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Business Data</h2>
        <button 
          onClick={handleRefresh}
          className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Refresh data"
          aria-label="Refresh data"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <ExpandableSection 
        title="Recent Leads" 
        icon={<FiUsers className="text-blue-500" />}
        initialExpanded={autoExpand}
        count={leads.length}
      >
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-500 mt-2">Loading leads...</p>
          </div>
        ) : error ? (
          <div className="text-center py-2 px-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Error loading leads</p>
            <button 
              onClick={handleRefresh}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              Try again
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-4 px-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">No leads found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Try asking the assistant to generate leads for your business
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map(lead => (
              <LeadItem key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </ExpandableSection>
    </div>
  );
} 