
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { TaskFilters } from '../hooks/useTaskFilters';

interface FilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  hasActiveFilters: boolean;
}

export function FilterPanel({ filters, onFiltersChange, hasActiveFilters }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const clearAllFilters = () => {
    onFiltersChange({
      search: filters.search, // Keep search
      priority: 'all',
      timeBlock: 'all',
      completed: 'all',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priority !== 'all') count++;
    if (filters.timeBlock !== 'all') count++;
    if (filters.completed !== 'all') count++;
    return count;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white/80 border-white/30 hover:bg-white/90 rounded-xl px-4 py-2 h-12 relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 bg-blue-500 text-white text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700 px-2 py-1 h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-glass z-50 min-w-[300px]"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => onFiltersChange({ ...filters, priority: value as TaskFilters['priority'] })}
                >
                  <SelectTrigger className="bg-white/80 border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="must-do">Must Do</SelectItem>
                    <SelectItem value="should-do">Should Do</SelectItem>
                    <SelectItem value="could-do">Could Do</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Time Block</label>
                <Select 
                  value={filters.timeBlock} 
                  onValueChange={(value) => onFiltersChange({ ...filters, timeBlock: value as TaskFilters['timeBlock'] })}
                >
                  <SelectTrigger className="bg-white/80 border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time Blocks</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select 
                  value={filters.completed} 
                  onValueChange={(value) => onFiltersChange({ ...filters, completed: value as TaskFilters['completed'] })}
                >
                  <SelectTrigger className="bg-white/80 border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
