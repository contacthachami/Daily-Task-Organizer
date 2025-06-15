
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TaskFilters } from '../types/task';

interface FilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  hasActiveFilters: boolean;
}

export function FilterPanel({ filters, onFiltersChange, hasActiveFilters }: FilterPanelProps) {
  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priority: 'all',
      timeBlock: 'all',
      completed: 'all'
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        
        <Select 
          value={filters.priority} 
          onValueChange={(value) => onFiltersChange({ ...filters, priority: value as any })}
        >
          <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-white/30">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="must-do">Must Do</SelectItem>
            <SelectItem value="should-do">Should Do</SelectItem>
            <SelectItem value="could-do">Could Do</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.timeBlock} 
          onValueChange={(value) => onFiltersChange({ ...filters, timeBlock: value as any })}
        >
          <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-white/30">
            <SelectValue placeholder="Time Block" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Times</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="afternoon">Afternoon</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.completed} 
          onValueChange={(value) => onFiltersChange({ ...filters, completed: value as any })}
        >
          <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-white/30">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="bg-white/80 backdrop-blur-sm border-white/30"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
