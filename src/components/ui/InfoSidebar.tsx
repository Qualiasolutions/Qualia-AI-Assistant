import React from 'react';
import { FiInfo } from 'react-icons/fi';

export default function InfoSidebar() {
  return (
    <div className="flex flex-col p-4 h-full">
      <div className="flex items-center mb-4">
        <FiInfo className="text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold">Information</h2>
      </div>
      
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">About Tzironis Business</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Tzironis is a leading wholesale company specializing in furniture and home goods,
          serving retailers across Greece since 1985.
        </p>
      </div>
      
      <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Current Promotions</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
          <li>10% off all dining sets until end of month</li>
          <li>Free delivery for orders over €2,000</li>
          <li>Special pricing for bulk orders</li>
        </ul>
      </div>
      
      <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Contact Information</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Email: sales@tzironis.gr<br/>
          Phone: +30 210 123 4567<br/>
          Hours: Mon-Fri 9:00-18:00
        </p>
      </div>
    </div>
  );
} 