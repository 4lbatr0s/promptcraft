import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch.js'
import urlResolver from '../lib/urlResolver.js'
// Import new components
import HistoryItem from "@/components/history/HistoryItem";
import HistoryFilters from "@/components/history/HistoryFilters";
import HistoryStats from "@/components/history/HistoryStats";

export default function History() {
  const { isAuthenticated, isLoading } = useKindeAuth()
  const [conversions, setConversions] = useState([]);
  const [filteredConversions, setFilteredConversions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedConversion, setSelectedConversion] = useState(null);
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    if (isAuthenticated) {
      loadConversions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterConversions();
  }, [conversions, searchTerm, selectedProvider, dateRange]);

  const loadConversions = async () => {
    setIsLoadingData(true);
    try {
      const response = await authenticatedFetch(urlResolver.getHistoryUrl());
      const data = await response.json();
      if (data.success) {
        setConversions(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load conversions:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterConversions = () => {
    let filtered = conversions;
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.originalPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.llmProvider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Provider filter
    if (selectedProvider !== "all") {
      filtered = filtered.filter(conv => conv.llmProvider === selectedProvider);
    }
    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const dateThreshold = new Date();
      switch (dateRange) {
        case "today":
          dateThreshold.setHours(0, 0, 0, 0);
          break;
        case "week":
          dateThreshold.setDate(now.getDate() - 7);
          break;
        case "month":
          dateThreshold.setMonth(now.getMonth() - 1);
          break;
      }
      filtered = filtered.filter(conv => 
        new Date(conv.createdAt) >= dateThreshold
      );
    }
    setFilteredConversions(filtered);
  };

  const handleDelete = async (id) => {
    try {
      const response = await authenticatedFetch(`${urlResolver.getHistoryUrl()}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setConversions(prev => prev.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete conversion:", error);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Prompt", "Provider"],
      ...filteredConversions.map(conv => [
        format(new Date(conv.createdAt), "yyyy-MM-dd HH:mm:ss"),
        conv.originalPrompt.replace(/"/g, '""'),
        conv.llmProvider
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prompt-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const uniqueProviders = [...new Set(conversions.map(c => c.llmProvider))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to continue</h1>
          <p className="text-blue-200">You need to be authenticated to access the history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Conversion History
              </h1>
              <p className="text-blue-200">
                Track and manage your prompt optimization history
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={filteredConversions.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </motion.div>
        {/* Stats */}
        <HistoryStats conversions={conversions} />
        {/* Filters */}
        <HistoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          providers={uniqueProviders}
        />
        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Results ({filteredConversions.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-white/10 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredConversions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No conversions found
                  </h3>
                  <p className="text-blue-200">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredConversions.map((conversion) => (
                      <HistoryItem
                        key={conversion._id}
                        conversion={conversion}
                        onDelete={handleDelete}
                        onView={setSelectedConversion}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 