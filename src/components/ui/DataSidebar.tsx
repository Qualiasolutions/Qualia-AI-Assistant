import React, { useState } from 'react';
import { FiUsers, FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi';

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

export default function DataSidebar() {
  return (
    <div className="flex flex-col p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Business Data</h2>
      
      <ExpandableSection 
        title="Recent Leads" 
        icon={<FiUsers className="text-blue-500" />}
      >
        <div className="space-y-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="font-medium">Furniture Planet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Retail Store • Athens</p>
            <p className="text-xs mt-1">Status: <span className="text-green-600 dark:text-green-400">Contacted</span></p>
          </div>
          
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="font-medium">Home Design Co.</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Interior Design • Thessaloniki</p>
            <p className="text-xs mt-1">Status: <span className="text-amber-600 dark:text-amber-400">New</span></p>
          </div>
          
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">
            View all leads →
          </button>
        </div>
      </ExpandableSection>
      
      <ExpandableSection 
        title="Recent Invoices" 
        icon={<FiFileText className="text-green-500" />}
      >
        <div className="space-y-3">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="font-medium">INV-2023-0458</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Home Essentials Ltd • €3,250</p>
            <p className="text-xs mt-1">Status: <span className="text-green-600 dark:text-green-400">Paid</span></p>
          </div>
          
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="font-medium">INV-2023-0459</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Comfort Living • €1,820</p>
            <p className="text-xs mt-1">Status: <span className="text-amber-600 dark:text-amber-400">Pending</span></p>
          </div>
          
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">
            View all invoices →
          </button>
        </div>
      </ExpandableSection>
    </div>
  );
} 