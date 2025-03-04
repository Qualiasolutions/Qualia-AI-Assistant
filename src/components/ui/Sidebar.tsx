import React from 'react';
import { motion } from 'framer-motion';

type SidebarProps = {
  children: React.ReactNode;
  position: 'left' | 'right';
  className?: string;
};

export default function Sidebar({ children, position, className = '' }: SidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: position === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`hidden md:flex flex-col bg-white dark:bg-gray-800 border-${position === 'left' ? 'r' : 'l'} border-gray-200 dark:border-gray-700 h-full w-72 overflow-y-auto ${className}`}
    >
      {children}
    </motion.div>
  );
} 