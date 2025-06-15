
import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      
      <Input
        id="search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 bg-white/80 border-white/30 backdrop-blur-sm focus:bg-white/90 focus:border-blue-300 transition-all duration-200 rounded-xl h-12 text-base font-medium"
      />
      
      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
