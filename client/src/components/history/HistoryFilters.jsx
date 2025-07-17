import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HistoryFilters({
  searchTerm,
  onSearchChange,
  selectedProvider,
  onProviderChange,
  dateRange,
  onDateRangeChange,
  providers
}) {
  const activeFiltersCount = [
    searchTerm,
    selectedProvider !== "all" ? selectedProvider : null,
    dateRange !== "all" ? dateRange : null
  ].filter(Boolean).length;

  const clearFilters = () => {
    onSearchChange("");
    onProviderChange("all");
    onDateRangeChange("all");
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
            <Input
              placeholder="Search prompts or providers..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-black/30 border-white/20 text-white placeholder-blue-200"
            />
          </div>
          {/* Provider Filter */}
          <Select value={selectedProvider} onValueChange={onProviderChange}>
            <SelectTrigger className="w-full md:w-48 bg-black/30 border-white/20 text-white">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-full md:w-48 bg-black/30 border-white/20 text-white">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-white/20 text-white hover:bg-white/5"
            >
              <X className="w-4 h-4 mr-2" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Search: {searchTerm}
              </Badge>
            )}
            {selectedProvider !== "all" && (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Provider: {selectedProvider}
              </Badge>
            )}
            {dateRange !== "all" && (
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                Date: {dateRange}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 